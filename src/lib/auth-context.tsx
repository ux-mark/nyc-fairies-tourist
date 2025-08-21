"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';


import { debugLog } from './utils';
import type { Attraction } from './attractions';


interface User {
  user_id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: object | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  canEditAttraction: (attraction: Attraction) => boolean;
  canApprove: boolean;
  canDelete: (attraction: Attraction) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Ensure user exists in Supabase users table
  const ensureUserInDatabase = async (user: { id: string; email?: string }) => {
    if (!user || !user.id) return;
    debugLog('[AuthProvider] Ensuring user exists in DB', user.id);
    const { data, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (selectError && selectError.code !== 'PGRST116') {
      debugLog('[AuthProvider] User select error', selectError);
      return;
    }
    if (!data) {
      debugLog('[AuthProvider] Creating user in DB', user.id);
      const { error: insertError, status } = await supabase
        .from('users')
        .insert({ user_id: user.id, email: user.email ?? '' });
      if (insertError && status !== 409) {
        debugLog('[AuthProvider] User insert error', insertError);
      } else if (status === 409) {
        debugLog('[AuthProvider] User already exists (409)', user.id);
      }
    }
  };
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<object | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
  const userObj = data?.session?.user || null;
      debugLog('[AuthProvider] Supabase user object:', userObj);
      if (userObj) await ensureUserInDatabase(userObj);
      // Fetch user role from DB
      if (userObj) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', userObj.id)
          .single();
        setUser(dbUser || null);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
  const userObj = session?.user || null;
      debugLog('[AuthProvider] Supabase user object (onAuthStateChange):', userObj);
      if (userObj) await ensureUserInDatabase(userObj);
      if (userObj) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', userObj.id)
          .single();
        setUser(dbUser || null);
      } else {
        setUser(null);
      }
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

  // Role helpers
  const isAdmin = user?.role === 'admin';
  const canEditAttraction = (attraction: Attraction) => {
    if (!user) return false;
    return isAdmin || attraction.created_by === user.user_id;
  };
  const canApprove = isAdmin;
  const canDelete = (attraction: Attraction) => {
    if (!user) return false;
    return isAdmin || (attraction.created_by === user.user_id && attraction.status === 'pending');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, isAdmin, canEditAttraction, canApprove, canDelete }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
