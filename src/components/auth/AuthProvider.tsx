'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isShipper: boolean;
  isCarrier: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Immediately start redirect - don't wait for async operations
    const doRedirect = () => {
      window.location.href = '/login';
    };

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase signOut error:', error);

      setUser(null);
      setProfile(null);

      // Clear localStorage and sessionStorage first (sync)
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.error('Storage clear error:', e);
      }

      // Clear caches (async but don't block)
      if ('caches' in window) {
        caches.keys().then(keys => {
          Promise.all(keys.map(key => caches.delete(key)));
        }).catch(() => {});
      }

      // Unregister service workers (async but don't block)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(r => r.unregister());
        }).catch(() => {});
      }

      // Force redirect after small delay to ensure state updates
      setTimeout(doRedirect, 100);
    } catch (err) {
      console.error('Logout failed:', err);
      // Force redirect even on error
      doRedirect();
    }
  };

  const isShipper = profile?.role === 'shipper';
  const isCarrier = profile?.role === 'carrier';
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
        isShipper,
        isCarrier,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
