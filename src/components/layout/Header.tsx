'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { createBrowserClient } from '@/lib/supabase';
import { LanguageToggle } from './LanguageToggle';
import { Button } from '@/components/ui/button';
import { Truck, LayoutDashboard, LogOut } from 'lucide-react';
import type { UserRole } from '@/types';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
  const { t } = useLanguage();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setUserRole(profile?.role || null);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin': return '/admin/dashboard';
      case 'shipper': return '/shipper/dashboard';
      case 'carrier': return '/carrier/dashboard';
      default: return '/';
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      setUserRole(null);

      // Clear all browser caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.unregister();
        }
      }

      // Force hard redirect to login page
      window.location.replace('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      window.location.replace('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">{t('appName')}</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <LanguageToggle />

          {showAuthButtons && !loading && (
            <div className="flex items-center gap-2">
              {userRole ? (
                <>
                  <Button variant="default" asChild>
                    <Link href={getDashboardLink()}>
                      <LayoutDashboard className="h-4 w-4 ml-2" />
                      {t('dashboard')}
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 ml-2" />
                    {t('signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">{t('login')}</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">{t('register')}</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
