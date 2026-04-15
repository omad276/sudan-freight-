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
      // Force a hard redirect and clear the session
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white w-full overflow-x-hidden border-b">
      <div className="flex flex-wrap justify-between items-center gap-2 px-3 py-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">{t('appName')}</span>
        </Link>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <LanguageToggle />

          {showAuthButtons && !loading && (
            <div className="flex flex-wrap gap-2">
              {userRole ? (
                <>
                  <Button variant="default" size="sm" asChild>
                    <Link href={getDashboardLink()}>
                      <LayoutDashboard className="h-4 w-4 ml-1" />
                      {t('dashboard')}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 ml-1" />
                    {t('signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">{t('login')}</Link>
                  </Button>
                  <Button size="sm" asChild>
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
