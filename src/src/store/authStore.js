// src/stores/authStore.js
import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  signUp: async (email, password, username, displayName) => {
    // 1. Sign up with Supabase Auth (store metadata)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName }, // optional, for metadata
      },
    });
    if (error) throw error;

    // 2. Manually insert the profile (trigger disabled or absent)
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          display_name: displayName,
          // avatar_url: null, // can be added later
        });
      if (profileError) {
        console.error('Profile creation failed:', profileError);
        // Optional: clean up the auth user if profile insert fails
        // Note: requires admin privileges – for production, handle differently
        throw new Error('Account created but profile setup failed. Please contact support.');
      }
    }

    // 3. Fetch the newly created profile and update state
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      set({ user: data.user, profile, loading: false });
    }
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    set({ user: data.user });
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    set({ profile, loading: false });
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, loading: false });
  },

  setSession: (session) => {
    const user = session?.user ?? null;
    set({ user, loading: false });
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => set({ profile: data }))
        .catch(() => set({ profile: null })); // fallback if profile missing
    } else {
      set({ profile: null });
    }
  },
}));

// Listen to auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});