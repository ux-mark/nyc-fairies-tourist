"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import { debugLog } from './utils';

interface AuthContextType {
  user: unknown;
  session: unknown;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Ensure user exists in Supabase users table
  const ensureUserInDatabase = async (user: User) => {
    if (!user || !user.id) return;
    debugLog('[AuthProvider] Ensuring user exists in DB', user.id);
    const { data } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    if (!data) {
      debugLog('[AuthProvider] Creating user in DB', user.id);
      const { error: insertError } = await supabase
        .from('users')
        .insert({ user_id: user.id, email: user.email });
      if (insertError) debugLog('[AuthProvider] User insert error', insertError);
    }
  };
  const [user, setUser] = useState<unknown>(null);
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
      setUser(data?.session?.user || null);
  debugLog('[AuthProvider] Supabase user object:', data?.session?.user);
  if (data?.session?.user) await ensureUserInDatabase(data.session.user);
      setLoading(false);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
  debugLog('[AuthProvider] Supabase user object (onAuthStateChange):', session?.user);
  if (session?.user) ensureUserInDatabase(session.user);
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
