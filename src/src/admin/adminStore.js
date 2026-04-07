import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useAdminStore = create((set, get) => ({
  isAdmin: false,
  adminChecked: false,
  stats: null,
  users: [],
  posts: [],
  reports: [],
  streams: [],
  withdrawals: [],
  auditLogs: [],
  loading: false,

  checkAdmin: async (userId) => {
    if (!userId) { set({ isAdmin: false, adminChecked: true }); return; }
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();
    set({ isAdmin: !!data?.is_admin, adminChecked: true });
  },

  fetchStats: async () => {
    set({ loading: true });
    const [
      { count: totalUsers },
      { count: totalPosts },
      { count: totalStreams },
      { count: pendingReports },
      { count: pendingWithdrawals },
      { data: giftsData },
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('live_streams').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('gifts').select('amount'),
    ]);
    const totalRevenue = giftsData?.reduce((s, g) => s + (g.amount || 0), 0) || 0;
    // New users in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo);
    set({
      stats: { totalUsers, totalPosts, totalStreams, pendingReports, pendingWithdrawals, totalRevenue, newUsers },
      loading: false,
    });
  },

  fetchUsers: async ({ page = 0, search = '', filter = 'all' } = {}) => {
    set({ loading: true });
    let query = supabase
      .from('profiles')
      .select('*, posts:posts(count), followers:follows!following_id(count)')
      .order('created_at', { ascending: false })
      .range(page * 20, page * 20 + 19);
    if (search) query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    if (filter === 'banned') query = query.eq('is_banned', true);
    if (filter === 'admin') query = query.eq('is_admin', true);
    if (filter === 'premium') query = query.eq('premium', true);
    const { data } = await query;
    set({ users: data || [], loading: false });
  },

  fetchPosts: async ({ page = 0, search = '' } = {}) => {
    set({ loading: true });
    let query = supabase
      .from('posts')
      .select('*, user:profiles(id, username, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .range(page * 20, page * 20 + 19);
    if (search) query = query.ilike('content', `%${search}%`);
    const { data } = await query;
    set({ posts: data || [], loading: false });
  },

  fetchReports: async ({ filter = 'pending' } = {}) => {
    set({ loading: true });
    let query = supabase
      .from('reports')
      .select('*, reporter:profiles!reporter_id(username, display_name)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    set({ reports: data || [], loading: false });
  },

  fetchStreams: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('live_streams')
      .select('*, user:profiles(username, display_name)')
      .order('started_at', { ascending: false })
      .limit(50);
    set({ streams: data || [], loading: false });
  },

  fetchWithdrawals: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('withdrawals')
      .select('*, user:profiles(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(50);
    set({ withdrawals: data || [], loading: false });
  },

  fetchAuditLogs: async () => {
    const { data } = await supabase
      .from('admin_logs')
      .select('*, admin:profiles!admin_id(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    set({ auditLogs: data || [] });
  },

  // Actions
  banUser: async (userId, reason, adminId) => {
    await supabase.from('profiles').update({ is_banned: true, ban_reason: reason, banned_at: new Date().toISOString() }).eq('id', userId);
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'ban_user', target_type: 'user', target_id: userId, details: { reason } });
    set(s => ({ users: s.users.map(u => u.id === userId ? { ...u, is_banned: true, ban_reason: reason } : u) }));
  },

  unbanUser: async (userId, adminId) => {
    await supabase.from('profiles').update({ is_banned: false, ban_reason: null, banned_at: null }).eq('id', userId);
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'unban_user', target_type: 'user', target_id: userId, details: {} });
    set(s => ({ users: s.users.map(u => u.id === userId ? { ...u, is_banned: false } : u) }));
  },

  toggleAdmin: async (userId, makeAdmin, adminId) => {
    await supabase.from('profiles').update({ is_admin: makeAdmin }).eq('id', userId);
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: makeAdmin ? 'grant_admin' : 'revoke_admin', target_type: 'user', target_id: userId, details: {} });
    set(s => ({ users: s.users.map(u => u.id === userId ? { ...u, is_admin: makeAdmin } : u) }));
  },

  deletePost: async (postId, adminId) => {
    await supabase.from('posts').delete().eq('id', postId);
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'delete_post', target_type: 'post', target_id: postId, details: {} });
    set(s => ({ posts: s.posts.filter(p => p.id !== postId) }));
  },

  resolveReport: async (reportId, status, adminId) => {
    await supabase.from('reports').update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() }).eq('id', reportId);
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: `report_${status}`, target_type: 'report', target_id: reportId, details: {} });
    set(s => ({ reports: s.reports.map(r => r.id === reportId ? { ...r, status } : r) }));
  },

  processWithdrawal: async (withdrawalId, status, adminId) => {
    await supabase.from('withdrawals').update({ status, processed_at: new Date().toISOString() }).eq('id', withdrawalId);
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: `withdrawal_${status}`, target_type: 'withdrawal', target_id: withdrawalId, details: {} });
    set(s => ({ withdrawals: s.withdrawals.map(w => w.id === withdrawalId ? { ...w, status } : w) }));
  },

  endStream: async (streamId, adminId) => {
    await supabase.from('live_streams').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', streamId);
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'end_stream', target_type: 'stream', target_id: streamId, details: {} });
    set(s => ({ streams: s.streams.map(st => st.id === streamId ? { ...st, status: 'ended' } : st) }));
  },
}));
