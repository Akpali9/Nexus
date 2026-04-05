// Inside MessagesPage.js, replace the relevant parts:

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';

export default function MessagesPage() {
  const { user } = useAuth();
  const { newMessages, emit } = useRealtime();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
      if (data) {
        const convIds = data.map(c => c.conversation_id);
        const { data: convs } = await supabase
          .from('conversations')
          .select('*, participants:conversation_participants(user:profiles(*))')
          .in('id', convIds);
        if (convs) setConversations(convs);
      }
    };
    fetchConversations();
  }, [user]);

  // Load messages when conversation opens
  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles(*)')
        .eq('conversation_id', activeConv.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(prev => ({ ...prev, [activeConv.id]: data }));
    };
    fetchMessages();
  }, [activeConv]);

  // Append real-time messages
  useEffect(() => {
    if (!activeConv) return;
    const newMsgs = newMessages.filter(m => m.conversation_id === activeConv.id);
    if (newMsgs.length) {
      setMessages(prev => ({
        ...prev,
        [activeConv.id]: [...(prev[activeConv.id] || []), ...newMsgs]
      }));
    }
  }, [newMessages, activeConv]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const newMsg = {
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: input
    };
    const { data } = await supabase.from('messages').insert(newMsg).select('*, sender:profiles(*)').single();
    if (data) {
      setMessages(prev => ({
        ...prev,
        [activeConv.id]: [...(prev[activeConv.id] || []), data]
      }));
      emit('new_message', data);
      setInput('');
    }
  };

  // ... render JSX similar to original but using real data
}
