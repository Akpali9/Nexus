import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Gift, Star, Zap, ArrowUpRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function MonetizePage() {
  const { profile } = useAuth();
  const [totalEarned, setTotalEarned] = useState(0);
  const [available, setAvailable] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const fetchBalance = async () => {
      const { data } = await supabase
        .from('earnings')
        .select('amount')
        .eq('user_id', profile.id);
      const total = data?.reduce((sum, e) => sum + e.amount, 0) || 0;
      setTotalEarned(total);
      setAvailable(total); // simplified
    };
    fetchBalance();

    // Subscribe to new gifts
    const giftSub = supabase
      .channel('gifts-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gifts' }, (payload) => {
        if (payload.new.to_user_id === profile.id) {
          setTotalEarned(prev => prev + payload.new.amount);
          setAvailable(prev => prev + payload.new.amount);
        }
      })
      .subscribe();
    return () => giftSub.unsubscribe();
  }, [profile]);

  // ... rest of UI (same as original but using dynamic totals)
}
