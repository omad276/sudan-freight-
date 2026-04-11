'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { Menu, X, Truck } from 'lucide-react';
import type { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen flex">
        {/* Desktop Sidebar */}
        <Sidebar role={role} className="hidden md:flex" />

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 md:hidden ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <Sidebar role={role} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span className="font-bold">{t('appName')}</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex items-center justify-end p-4 border-b border-border bg-card">
            <LanguageToggle />
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
