import { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, Search, Lock, Send, X, Camera, Loader2, 
  Settings, UserMinus, Shield, ShieldOff, Trash2, UserPlus,
  LogOut, Copy, Link as LinkIcon, CheckCircle, AtSign
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import Sidebar from '../components/layout/Sidebar';

const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ------------------- Toast Component -------------------
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: bgColor, color: 'white', padding: '12px 24px', borderRadius: 999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
      animation: 'slideUp 0.3s ease'
    }}>
      {type === 'success' && <CheckCircle size={16} />}
      {message}
    </div>
  );
}

// ------------------- Confirm Modal -------------------
function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: 320, padding: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={onConfirm} className="btn-primary" style={{ flex: 1, background: '#f87171' }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ------------------- Group Card -------------------
function GroupCard({ group, onClick, onJoinToggle, currentUserId, onToast }) {
  const [joined, setJoined] = useState(group.joined);
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (joined) {
        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', group.id)
          .eq('user_id', currentUserId);
        if (error) throw error;
        setJoined(false);
        onJoinToggle(group.id, false);
        onToast({ message: `Left ${group.name}`, type: 'success' });
      } else {
        const { error } = await supabase
          .from('group_members')
          .insert({ group_id: group.id, user_id: currentUserId, role: 'member' });
        if (error) throw error;
        setJoined(true);
        onJoinToggle(group.id, true);
        onToast({ message: `Joined ${group.name}`, type: 'success' });
      }
    } catch (err) {
      onToast({ message: err.message, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => onClick(group)}>
      <div style={{ height: 80, background: `linear-gradient(135deg, var(--accent-primary)22, var(--accent-secondary)11)`, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-glow)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {group.avatar_url ? <img src={group.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24 }}>👥</span>}
        </div>
        {group.is_private && <span style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.4)', fontSize: 10, padding: '3px 8px', borderRadius: 999 }}><Lock size={9} /> Private</span>}
      </div>
      <div style={{ padding: '12px 16px 16px' }}>
        <p style={{ fontWeight: 700 }}>{group.name}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{group.description || 'No description'}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}><Users size={12} /> {group.member_count} members</span>
          <button onClick={handleJoin} disabled={loading} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, background: joined ? 'transparent' : 'var(--accent-primary)', color: joined ? 'var(--text-muted)' : 'white', border: joined ? '1px solid var(--border-default)' : 'none' }}>
            {joined ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- Add Members Modal -------------------
function AddMembersModal({ group, onClose, onMemberAdded, onToast }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    if (search.length < 2) {
      setUsers([]);
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .or(`display_name.ilike.%${search}%,username.ilike.%${search}%`)
        .limit(20);
      const { data: existing } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id);
      const existingIds = new Set(existing?.map(e => e.user_id) || []);
      setUsers(profiles?.filter(u => !existingIds.has(u.id)) || []);
      setLoading(false);
    };
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [search, group.id]);

  const addMember = async (userId) => {
    setAdding(userId);
    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId, role: 'member' });
    if (!error) {
      onMemberAdded();
      setSearch('');
      onToast({ message: 'Member added', type: 'success' });
    } else {
      onToast({ message: error.message, type: 'error' });
    }
    setAdding(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: 400, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add Members</h3>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Search by name or username..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto', marginTop: 12 }}>
            {loading && <div className="loading">Searching...</div>}
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="avatar-placeholder" style={{ width: 36, height: 36 }}>{u.display_name?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{u.display_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{u.username}</p>
                </div>
                <button onClick={() => addMember(u.id)} disabled={adding === u.id} className="btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}>
                  {adding === u.id ? <Loader2 size={12} className="spin" /> : 'Add'}
                </button>
              </div>
            ))}
            {search.length >= 2 && users.length === 0 && !loading && <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No users found</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------- Member List Modal -------------------
function MemberListModal({ group, onClose, currentUserId, onMemberUpdate, onToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const currentMember = members.find(m => m.user_id === currentUserId);
  const isAdmin = currentMember?.role === 'admin';
  const creatorId = group.created_by;
  const otherAdmins = members.filter(m => m.role === 'admin' && m.user_id !== creatorId);
  const canDemoteCreator = otherAdmins.length > 0;

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('group_members')
      .select('*, user:profiles(*)')
      .eq('group_id', group.id);
    if (error) console.error('Fetch members error:', error);
    if (data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
    const channel = supabase.channel(`group-members-${group.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${group.id}` }, fetchMembers)
      .subscribe();
    return () => channel.unsubscribe();
  }, [group.id]);

  const updateRole = async (memberId, newRole) => {
    setActionLoading(memberId);
    const { error } = await supabase
      .from('group_members')
      .update({ role: newRole })
      .eq('group_id', group.id)
      .eq('user_id', memberId);
    if (!error) {
      onMemberUpdate();
      onToast({ message: `Role updated to ${newRole}`, type: 'success' });
    }
    setActionLoading(null);
  };

  const removeMember = async (memberId) => {
    setActionLoading(memberId);
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('user_id', memberId);
    if (!error) {
      onMemberUpdate();
      onToast({ message: 'Member removed', type: 'success' });
    }
    setActionLoading(null);
    setConfirmState(null);
  };

  const demoteCreator = async () => {
    if (!canDemoteCreator) {
      onToast({ message: 'Promote another member to admin first', type: 'error' });
      setConfirmState(null);
      return;
    }
    setActionLoading(creatorId);
    await updateRole(creatorId, 'member');
    setConfirmState(null);
  };

  const leaveGroup = async () => {
    await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', currentUserId);
    onMemberUpdate();
    onClose();
    onToast({ message: 'You left the group', type: 'success' });
    setConfirmState(null);
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join-group/${group.id}`;
    navigator.clipboard.writeText(inviteLink);
    onToast({ message: 'Invite link copied to clipboard!', type: 'success' });
  };

  const openConfirm = (action, memberId = null) => {
    if (action === 'leave') setConfirmState({ message: 'Leave this group? You can rejoin later.', onConfirm: leaveGroup });
    else if (action === 'demote') setConfirmState({ message: 'Step down as admin? You will become a regular member.', onConfirm: demoteCreator });
    else if (action === 'remove') setConfirmState({ message: 'Remove this member?', onConfirm: () => removeMember(memberId) });
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} className="card" style={{ width: 400, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Members ({members.length})</h3>
            <button onClick={onClose} className="btn-icon"><X size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {loading ? <div className="loading" style={{ padding: 20 }}>Loading...</div> : members.map(m => {
              const isCreator = m.user_id === group.created_by;
              const isSelf = m.user_id === currentUserId;
              return (
                <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="avatar-placeholder" style={{ width: 40, height: 40 }}>{m.user?.display_name?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{m.user?.display_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{m.user?.username}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {m.role === 'admin' && <span style={{ fontSize: 11, background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: 999 }}>Admin</span>}
                    {isCreator && <span style={{ fontSize: 11, background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 999 }}>Creator</span>}
                    {isAdmin && !isCreator && !isSelf && (
                      <>
                        {m.role === 'admin' ? (
                          <button onClick={() => updateRole(m.user_id, 'member')} className="btn-icon" title="Demote"><ShieldOff size={16} /></button>
                        ) : (
                          <button onClick={() => updateRole(m.user_id, 'admin')} className="btn-icon" title="Make admin"><Shield size={16} /></button>
                        )}
                        <button onClick={() => openConfirm('remove', m.user_id)} className="btn-icon" title="Remove"><UserMinus size={16} style={{ color: '#f87171' }} /></button>
                      </>
                    )}
                    {isCreator && isSelf && isAdmin && (
                      <button onClick={() => openConfirm('demote')} className="btn-icon" title="Step down"><ShieldOff size={16} /></button>
                    )}
                    {actionLoading === m.user_id && <Loader2 size={16} className="spin" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
            <button onClick={copyInviteLink} className="btn-primary" style={{ flex: 1, gap: 8 }}><LinkIcon size={14} /> Copy Invite Link</button>
            <button onClick={() => openConfirm('leave')} className="btn-ghost" style={{ color: '#f87171', gap: 8 }}><LogOut size={14} /> Leave</button>
          </div>
        </div>
      </div>
      {confirmState && <ConfirmModal message={confirmState.message} onConfirm={confirmState.onConfirm} onClose={() => setConfirmState(null)} />}
    </>
  );
}

// ------------------- Group Settings Modal (Edit Group) -------------------
function GroupSettingsModal({ group, onClose, onGroupUpdate, onDeleteGroup, onToast }) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [isPrivate, setIsPrivate] = useState(group.is_private);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef(null);

  const uploadAvatar = async (file) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${group.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('group_avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('group_avatars').getPublicUrl(fileName);
      const avatarUrl = urlData.publicUrl;
      await supabase.from('groups').update({ avatar_url: avatarUrl }).eq('id', group.id);
      onGroupUpdate({ ...group, avatar_url: avatarUrl });
      onToast({ message: 'Avatar updated', type: 'success' });
    } catch (err) { 
      onToast({ message: err.message, type: 'error' });
    } finally { setUploading(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await supabase.from('groups').update({ name, description, is_private: isPrivate }).eq('id', group.id);
    if (!error) {
      onGroupUpdate({ ...group, name, description, is_private: isPrivate });
      onToast({ message: 'Settings saved', type: 'success' });
      onClose();
    } else {
      onToast({ message: error.message, type: 'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await supabase.from('group_messages').delete().eq('group_id', group.id);
    await supabase.from('group_members').delete().eq('group_id', group.id);
    const { error } = await supabase.from('groups').delete().eq('id', group.id);
    if (!error && onDeleteGroup) {
      onDeleteGroup(group.id);
      onToast({ message: 'Group deleted', type: 'success' });
      onClose();
    } else {
      onToast({ message: error?.message, type: 'error' });
    }
    setConfirmDelete(false);
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} className="card" style={{ width: 480, padding: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Group Settings</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--accent-glow)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {group.avatar_url ? <img src={group.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>👥</span>}
              </div>
              <button onClick={() => fileInputRef.current.click()} disabled={uploading} style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--accent-primary)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-primary)' }}>
                {uploading ? <Loader2 size={14} className="spin" /> : <Camera size={14} color="white" />}
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files && uploadAvatar(e.target.files[0])} />
            </div>
            <div style={{ flex: 1 }}>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Group name" />
            </div>
          </div>
          <textarea className="input-field" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ marginBottom: 12 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
            Private group
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button onClick={saveSettings} disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <button onClick={() => setConfirmDelete(true)} className="btn-ghost" style={{ width: '100%', color: '#f87171', gap: 8 }}><Trash2 size={14} /> Delete Group</button>
          </div>
        </div>
      </div>
      {confirmDelete && <ConfirmModal message="Delete this group permanently? All messages will be lost." onConfirm={handleDelete} onClose={() => setConfirmDelete(false)} />}
    </>
  );
}

// ------------------- Group Chat Component -------------------
function GroupChat({ group, onClose, currentUserId, onGroupUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberRole, setMemberRole] = useState(null);
  const [toast, setToast] = useState(null);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const showToast = (msg) => setToast(msg);

  // Check membership and role
  useEffect(() => {
    const checkMembership = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('id, role')
        .eq('group_id', group.id)
        .eq('user_id', currentUserId)
        .maybeSingle();
      if (error) console.error('Membership check error:', error);
      if (data) {
        setIsMember(true);
        setMemberRole(data.role);
      } else {
        setIsMember(false);
        setMemberRole(null);
      }
    };
    checkMembership();
  }, [group.id, currentUserId]);

  // Load group members for mentions (only if member)
  useEffect(() => {
    if (!isMember) return;
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('group_members')
        .select('user_id, user:profiles(id, display_name, username)')
        .eq('group_id', group.id);
      if (data) setGroupMembers(data.map(m => m.user));
    };
    fetchMembers();
  }, [group.id, isMember]);

  // Load messages (only if member)
  useEffect(() => {
    if (!isMember) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });
      if (data) {
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, display_name, username, avatar_url').in('id', userIds);
        const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);
        setMessages(data.map(m => ({ ...m, user: profileMap[m.user_id] || { display_name: 'Unknown' } })));
      }
    };
    loadMessages();

    const channel = supabase.channel(`group-${group.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${group.id}` }, async (payload) => {
        const { data: newMsg } = await supabase.from('group_messages').select('*').eq('id', payload.new.id).single();
        if (newMsg) {
          const { data: profile } = await supabase.from('profiles').select('id, display_name, username, avatar_url').eq('id', newMsg.user_id).single();
          setMessages(prev => [...prev, { ...newMsg, user: profile }]);
        }
      })
      .subscribe();
    return () => channel.unsubscribe();
  }, [group.id, isMember]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    if (lastAtIndex !== -1 && cursorPos - lastAtIndex > 1) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (query.length > 0) {
        const filtered = groupMembers.filter(m => 
          m.username.toLowerCase().includes(query.toLowerCase()) ||
          m.display_name.toLowerCase().includes(query.toLowerCase())
        );
        setMentionSuggestions(filtered);
        setShowMentionDropdown(filtered.length > 0);
        setMentionIndex(0);
        return;
      }
    }
    setShowMentionDropdown(false);
  };

  const selectMention = (user) => {
    const cursorPos = inputRef.current.selectionStart;
    const textBeforeCursor = input.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.slice(0, lastAtIndex) + `@${user.username} ` + input.slice(cursorPos);
    setInput(newText);
    setShowMentionDropdown(false);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (showMentionDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % mentionSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
      } else if (e.key === 'Enter' && mentionSuggestions.length > 0) {
        e.preventDefault();
        selectMention(mentionSuggestions[mentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentionDropdown(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey && isMember) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !isMember) return;
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(input)) !== null) {
      const username = match[1];
      const user = groupMembers.find(m => m.username === username);
      if (user) mentions.push(user.id);
    }
    const { data, error } = await supabase
      .from('group_messages')
      .insert({ group_id: group.id, user_id: currentUserId, content: input, mentions })
      .select()
      .single();
    if (data) {
      const { data: profile } = await supabase.from('profiles').select('id, display_name, username, avatar_url').eq('id', currentUserId).single();
      setMessages(prev => [...prev, { ...data, user: profile }]);
      setInput('');
      for (const mentionedUserId of mentions) {
        await supabase.from('notifications').insert({
          user_id: mentionedUserId,
          type: 'mention',
          actor_id: currentUserId,
          group_id: group.id,
          message: `mentioned you in ${group.name}`,
        });
      }
    } else {
      showToast({ message: error?.message, type: 'error' });
    }
  };

  const renderMessageWithMentions = (text) => {
    const parts = [];
    const mentionRegex = /@(\w+)/g;
    let lastIndex = 0;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before) parts.push({ text: before, isMention: false });
      parts.push({ text: match[0], username: match[1], isMention: true });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), isMention: false });
    }
    return parts.map((part, idx) => {
      if (part.isMention) {
        return (
          <span
            key={idx}
            onClick={() => window.location.href = `/profile/${part.username}`}
            style={{ color: '#22c55e', cursor: 'pointer', fontWeight: 500, background: 'rgba(34,197,94,0.1)', borderRadius: 4, padding: '0 2px' }}
          >
            {part.text}
          </span>
        );
      }
      return <span key={idx}>{part.text}</span>;
    });
  };

  const isAdmin = memberRole === 'admin';
  const handleDeleteGroup = (groupId) => {
    onClose();
    onGroupUpdate({ id: groupId, deleted: true });
  };

  const handleJoin = async () => {
    setJoining(true);
    const { error } = await supabase.from('group_members').insert({ group_id: group.id, user_id: currentUserId, role: 'member' });
    if (!error) {
      const updatedGroup = { ...group, joined: true, member_count: (group.member_count || 0) + 1 };
      onGroupUpdate(updatedGroup);
      setIsMember(true);
      setMemberRole('member');
      showToast({ message: `Joined ${group.name}`, type: 'success' });
    } else {
      if (error.code === '23505') {
        showToast({ message: 'You are already a member', type: 'error' });
        setIsMember(true);
        const { data } = await supabase.from('group_members').select('role').eq('group_id', group.id).eq('user_id', currentUserId).single();
        if (data) setMemberRole(data.role);
        onGroupUpdate({ ...group, joined: true });
      } else {
        showToast({ message: error.message, type: 'error' });
      }
    }
    setJoining(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-glow)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {group.avatar_url ? <img src={group.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>👥</span>}
        </div>
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setShowMembers(true)}>
          <p style={{ fontWeight: 700 }}>{group.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.member_count} members</p>
        </div>
        {isMember && isAdmin && (
          <>
            <button onClick={() => setShowAddMembers(true)} className="btn-icon" title="Add members"><UserPlus size={18} /></button>
            <button onClick={() => setShowSettings(true)} className="btn-icon" title="Edit Group"><Settings size={18} /></button>
          </>
        )}
        <button onClick={onClose} className="btn-icon"><X size={18} /></button>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isMember ? (
          messages.map(msg => {
            const isOwn = msg.user_id === currentUserId;
            return (
              <div key={msg.id} style={{ display: 'flex', gap: 10, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                {!isOwn && <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 12 }}>{msg.user?.display_name?.[0]}</div>}
                <div style={{ maxWidth: '70%', background: isOwn ? 'var(--accent-primary)' : 'var(--bg-tertiary)', borderRadius: 18, padding: '8px 14px' }}>
                  {!isOwn && <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--accent-primary)' }}>{msg.user?.display_name}</p>}
                  <p style={{ fontSize: 14, wordBreak: 'break-word' }}>
                    {renderMessageWithMentions(msg.content)}
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: isOwn ? 'right' : 'left', marginTop: 4 }}>{formatTime(msg.created_at)}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>You are not a member of this group.</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>Join to see messages and participate.</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area (only for members) */}
      {isMember ? (
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              className="input-field"
              placeholder="Type a message... Use @ to mention someone"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              style={{ borderRadius: 999, paddingRight: '40px' }}
            />
            <AtSign size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            {showMentionDropdown && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, background: 'var(--bg-card)',
                border: '1px solid var(--border-default)', borderRadius: 12, marginBottom: 8,
                width: '100%', maxHeight: 200, overflowY: 'auto', zIndex: 10
              }}>
                {mentionSuggestions.map((user, idx) => (
                  <div
                    key={user.id}
                    onClick={() => selectMention(user)}
                    style={{
                      padding: '8px 12px', cursor: 'pointer',
                      background: idx === mentionIndex ? 'rgba(34,197,94,0.2)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 8
                    }}
                  >
                    <div className="avatar-placeholder" style={{ width: 28, height: 28 }}>{user.display_name?.[0]}</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{user.display_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSend} className="btn-primary" style={{ width: '100%', padding: '8px', gap: 8 }}><Send size={15} /> Send</button>
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={handleJoin} disabled={joining} className="btn-primary">
            {joining ? <Loader2 size={16} className="spin" /> : 'Join Group'}
          </button>
        </div>
      )}

      {showMembers && <MemberListModal group={group} onClose={() => setShowMembers(false)} currentUserId={currentUserId} onMemberUpdate={() => onGroupUpdate(group)} onToast={showToast} />}
      {showSettings && <GroupSettingsModal group={group} onClose={() => setShowSettings(false)} onGroupUpdate={onGroupUpdate} onDeleteGroup={handleDeleteGroup} onToast={showToast} />}
      {showAddMembers && <AddMembersModal group={group} onClose={() => setShowAddMembers(false)} onMemberAdded={() => onGroupUpdate(group)} onToast={showToast} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ------------------- Create Group Modal -------------------
function CreateGroupModal({ onClose, onCreated, onToast }) {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('groups')
      .insert({ name, description, is_private: isPrivate, created_by: user.id })
      .select()
      .single();
    if (data) {
      await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id, role: 'admin' });
      onCreated(data);
      onClose();
      onToast({ message: 'Group created!', type: 'success' });
    } else {
      onToast({ message: error.message, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: 480, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Create Group</h3>
        <input className="input-field" placeholder="Group name" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 12 }} />
        <textarea className="input-field" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ marginBottom: 12 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
          Private group
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="btn-primary" style={{ flex: 1 }}>{loading ? 'Creating...' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}

// ------------------- Main GroupsPage -------------------
export default function GroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  const fetchGroups = async () => {
    if (!user) return;
    const { data: allGroups } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
    if (!allGroups) return;
    
    const groupIds = allGroups.map(g => g.id);
    const { data: memberships } = await supabase.from('group_members').select('group_id').in('group_id', groupIds);
    const memberCounts = {};
    memberships?.forEach(m => memberCounts[m.group_id] = (memberCounts[m.group_id] || 0) + 1);
    
    const { data: myMemberships } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
    const joinedIds = new Set(myMemberships?.map(m => m.group_id) || []);
    
    setGroups(allGroups.map(g => ({
      ...g,
      member_count: memberCounts[g.id] || 0,
      joined: joinedIds.has(g.id)
    })));
  };

  useEffect(() => {
    fetchGroups();
    const channel = supabase.channel('groups-and-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, fetchGroups)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, fetchGroups)
      .subscribe();
    return () => channel.unsubscribe();
  }, [user]);

  const filtered = groups.filter(g => {
    const matches = g.name.toLowerCase().includes(search.toLowerCase());
    if (tab === 'joined') return matches && g.joined;
    return matches;
  });

  const handleJoinToggle = (groupId, joined) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined, member_count: g.member_count + (joined ? 1 : -1) } : g));
    if (activeGroup?.id === groupId) setActiveGroup(prev => ({ ...prev, joined, member_count: prev.member_count + (joined ? 1 : -1) }));
  };

  const handleCreateGroup = (newGroup) => {
    setGroups(prev => [{ ...newGroup, member_count: 1, joined: true }, ...prev]);
    setTab('joined');
  };

  const handleGroupUpdate = (updatedGroup) => {
    if (updatedGroup.deleted) {
      setGroups(prev => prev.filter(g => g.id !== updatedGroup.id));
      if (activeGroup?.id === updatedGroup.id) setActiveGroup(null);
      return;
    }
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? { ...g, ...updatedGroup } : g));
    if (activeGroup?.id === updatedGroup.id) setActiveGroup(prev => ({ ...prev, ...updatedGroup }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', height: 'calc(100vh - 0px)' }}>
        <div style={{ width: activeGroup ? 360 : '100%', borderRight: activeGroup ? '1px solid var(--border-subtle)' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}><span className="gradient-text">Groups</span></h1>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}><Plus size={14} /> Create</button>
            </div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 8, padding: 3 }}>
              <button onClick={() => setTab('all')} style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 13, background: tab === 'all' ? 'var(--bg-card)' : 'transparent', color: tab === 'all' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>Discover</button>
              <button onClick={() => setTab('joined')} style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: 13, background: tab === 'joined' ? 'var(--bg-card)' : 'transparent', color: tab === 'joined' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>My Groups</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {activeGroup ? (
              filtered.map(g => (
                <div key={g.id} onClick={() => setActiveGroup(g)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, cursor: 'pointer', background: activeGroup?.id === g.id ? 'var(--accent-glow)' : 'transparent', marginBottom: 4 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {g.avatar_url ? <img src={g.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>👥</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{g.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.member_count} members</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {filtered.map(g => (
                  <GroupCard 
                    key={g.id} 
                    group={g} 
                    onClick={() => {
                      if (!g.joined) {
                        showToast({ message: `Join "${g.name}" to start chatting`, type: 'error' });
                        return;
                      }
                      setActiveGroup(g);
                    }} 
                    onJoinToggle={handleJoinToggle} 
                    currentUserId={user?.id} 
                    onToast={showToast} 
                  />
                ))}
              </div>
            )}
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}><Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><p>{tab === 'joined' ? "You haven't joined any groups" : 'No groups found'}</p></div>}
          </div>
        </div>

        {activeGroup && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <GroupChat group={activeGroup} onClose={() => setActiveGroup(null)} currentUserId={user?.id} onGroupUpdate={handleGroupUpdate} />
          </div>
        )}
      </main>
      {showCreateModal && <CreateGroupModal onClose={() => setShowCreateModal(false)} onCreated={handleCreateGroup} onToast={showToast} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// Add keyframe animation for toast
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
