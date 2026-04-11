'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthProvider';
import { getAdminStats, getUnverifiedUsers, getPendingTrips, getPendingShipments } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared';
import {
  Users,
  Package,
  Truck,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { AdminStats, Profile, Trip, Shipment } from '@/types';

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [unverifiedUsers, setUnverifiedUsers] = useState<Profile[]>([]);
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [pendingShipments, setPendingShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsResult, usersResult, tripsResult, shipmentsResult] = await Promise.all([
        getAdminStats(),
        getUnverifiedUsers(),
        getPendingTrips(),
        getPendingShipments(),
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (usersResult.data) setUnverifiedUsers(usersResult.data as Profile[]);
      if (tripsResult.data) setPendingTrips(tripsResult.data as Trip[]);
      if (shipmentsResult.data) setPendingShipments(shipmentsResult.data as Shipment[]);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  const totalPending = (stats?.pending_trips || 0) + (stats?.pending_shipments || 0);

  const statCards = [
    {
      title: t('users'),
      value: stats?.total_users || 0,
      subValue: `${stats?.total_shippers || 0} ${t('shipper')} • ${stats?.total_carriers || 0} ${t('carrier')}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/users',
    },
    {
      title: t('pendingListings'),
      value: totalPending,
      subValue: `${stats?.pending_trips || 0} ${t('trips')} • ${stats?.pending_shipments || 0} ${t('cargoRequests')}`,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/admin/pending',
    },
    {
      title: t('trips'),
      value: stats?.published_trips || 0,
      subValue: t('published'),
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/trucks',
    },
    {
      title: t('cargoRequests'),
      value: stats?.published_shipments || 0,
      subValue: t('published'),
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/shipments',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">{t('adminDashboard')}</h1>
        <p className="text-muted-foreground">
          {t('welcomeBack')}, {profile?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    {stat.subValue && (
                      <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t('pendingTrips')}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/pending">
                {t('view')} {t('all')}
                <ArrowLeft className="h-4 w-4 mr-2 rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingTrips.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-5 w-5 ml-2" />
                {t('noPendingListings')}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTrips.slice(0, 5).map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {t(trip.from_city as any)}
                        <ArrowRight className="h-4 w-4" />
                        {t(trip.to_city as any)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trip.carrier?.name}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(trip.trip_date, language)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Shipments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('pendingCargoRequests')}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/pending">
                {t('view')} {t('all')}
                <ArrowLeft className="h-4 w-4 mr-2 rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingShipments.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-5 w-5 ml-2" />
                {t('noPendingListings')}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingShipments.slice(0, 5).map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {t(shipment.pickup_city as any)}
                        <ArrowRight className="h-4 w-4" />
                        {t(shipment.dropoff_city as any)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {shipment.shipper?.name} • {t(shipment.cargo_type as any)}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {shipment.weight_tons} {t('ton')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unverified Users */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('users')} - {t('notVerified')}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                {t('view')} {t('all')}
                <ArrowLeft className="h-4 w-4 mr-2 rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {unverifiedUsers.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-5 w-5 ml-2" />
                {t('noData')}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {unverifiedUsers.slice(0, 6).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(user.role as any)} • {user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
