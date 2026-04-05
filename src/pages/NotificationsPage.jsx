import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { Heart, UserPlus, MessageCircle, Radio, Gift, CheckCircle, BellOff } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { newNotifications, setNewNotifications } = useRealtime();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*, actor:profiles(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
    };
    fetchNotifs();
  }, [user]);

  useEffect(() => {
    if (newNotifications.length) {
      setNotifications(prev => [...newNotifications, ...prev]);
      setNewNotifications([]);
    }
  }, [newNotifications, setNewNotifications]);

  const markRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // ... rest of UI (same as original but using real data)
}
