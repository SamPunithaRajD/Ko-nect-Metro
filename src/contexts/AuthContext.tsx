import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, type User } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SESSION_KEY = 'konect_session_token';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = localStorage.getItem(SESSION_KEY);
      if (!token) return;

      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('user_id, expires_at')
        .eq('id', token)
        .maybeSingle();

      if (error || !session) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }

      if (new Date(session.expires_at) < new Date()) {
        await supabase.from('user_sessions').delete().eq('id', token);
        localStorage.removeItem(SESSION_KEY);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user_id)
        .maybeSingle();

      if (userData && !userError) {
        setUser(userData);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (err) {
      console.error('Session restore error:', err);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const hash = await hashPassword(password);

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('password_hash', hash)
      .maybeSingle();

    if (error) {
      throw new Error('Authentication service unavailable. Please try again.');
    }

    if (!userData) {
      throw new Error('Invalid email or password.');
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userData.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();

    if (sessionError || !sessionData) {
      throw new Error('Failed to create session. Please try again.');
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString(), login_attempts: 0 })
      .eq('id', userData.id);

    localStorage.setItem(SESSION_KEY, sessionData.id);
    setUser(userData);
  };

  const signOut = async () => {
    const token = localStorage.getItem(SESSION_KEY);
    if (token) {
      await supabase.from('user_sessions').delete().eq('id', token);
      localStorage.removeItem(SESSION_KEY);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
