/**
 * 🎨 PROTOTYPE MODE: Authentication Hook
 * Uses mock auth service instead of Supabase
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as authService from '@/services/mock/authService';
import type { User, Session } from '@/services/mock/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing mock session on mount
    authService.getSession().then(({ session }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    companyName?: string
  ) => {
    const { user, session, error } = await authService.signUp(
      email,
      password,
      fullName,
      companyName
    );

    if (!error && session && user) {
      setSession(session);
      setUser(user);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { user, session, error } = await authService.signIn(email, password);

    if (!error && session && user) {
      setSession(session);
      setUser(user);
    }

    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};