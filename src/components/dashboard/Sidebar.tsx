'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Plus,
  Truck,
  MapPin,
  Route,
  Users,
  CreditCard,
  CheckCircle,
  User,
  LogOut,
} from 'lucide-react';
import type { UserRole } from '@/types';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const shipperLinks: SidebarLink[] = [
  { href: '/shipper/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { href: '/shipper/new-shipment', label: 'postCargoRequest', icon: Plus },
  { href: '/shipper/shipments', label: 'myRequests', icon: Package },
  { href: '/browse', label: 'browse', icon: MapPin },
  { href: '/shipper/profile', label: 'profile', icon: User },
];

const carrierLinks: SidebarLink[] = [
  { href: '/carrier/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { href: '/carrier/trips/new', label: 'postTrip', icon: Plus },
  { href: '/carrier/trips', label: 'myTrips', icon: Route },
  { href: '/browse', label: 'browse', icon: MapPin },
  { href: '/carrier/profile', label: 'profile', icon: User },
];

const adminLinks: SidebarLink[] = [
  { href: '/admin/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/pending', label: 'pendingListings', icon: CheckCircle },
  { href: '/admin/approvals', label: 'approvalRequests', icon: CheckCircle },
  { href: '/admin/users', label: 'users', icon: Users },
  { href: '/admin/shipments', label: 'cargoRequests', icon: Package },
  { href: '/admin/trucks', label: 'trips', icon: Truck },
  { href: '/browse', label: 'browse', icon: MapPin },
];

function getLinksForRole(role: UserRole): SidebarLink[] {
  switch (role) {
    case 'shipper':
      return shipperLinks;
    case 'carrier':
      return carrierLinks;
    case 'admin':
      return adminLinks;
    default:
      return [];
  }
}

interface SidebarProps {
  role: UserRole;
  className?: string;
}

export function Sidebar({ role, className }: SidebarProps) {
  const { t } = useLanguage();
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

  const links = getLinksForRole(role);

  return (
    <aside
      className={cn(
        'flex flex-col w-64 bg-card border-l border-border',
        className
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Truck className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">{t('appName')}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              )}
            >
              <link.icon className="w-5 h-5" />
              <span>{t(link.label as any)}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{profile?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {t(role as any)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 ml-2" />
          {t('signOut')}
        </Button>
      </div>
    </aside>
  );
}
