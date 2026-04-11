'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCarrierStats, getMyTrips } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState, PriceDisplay } from '@/components/shared';
import {
  Plus,
  Clock,
  CheckCircle,
  Route,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { CarrierStats, Trip } from '@/types';

export default function CarrierDashboardPage() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [stats, setStats] = useState<CarrierStats | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsResult, tripsResult] = await Promise.all([
        getCarrierStats(),
        getMyTrips(),
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (tripsResult.data) setTrips((tripsResult.data as Trip[]).slice(0, 5));
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  const statCards = [
    {
      title: t('trips'),
      value: stats?.total_trips || 0,
      icon: Route,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('pending_payment'),
      value: stats?.pending_payment || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: t('published'),
      value: stats?.published || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t('welcomeBack')}، {profile?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">{t('appDescription')}</p>
        </div>
        <Button asChild>
          <Link href="/carrier/trips/new">
            <Plus className="h-4 w-4 ml-2" />
            {t('postTrip')}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('myTrips')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/carrier/trips">
              {t('view')} {t('all')}
              <ArrowLeft className="h-4 w-4 mr-2 rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <EmptyState
              icon="truck"
              title={t('noTrips')}
              description={t('tripPendingMessage')}
              actionLabel={t('postTrip')}
              actionHref="/carrier/trips/new"
            />
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {t(trip.from_city as any)}
                      <ArrowRight className="h-4 w-4" />
                      {t(trip.to_city as any)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(trip.trip_date, language)}
                      </span>
                      {trip.price_sdg && <PriceDisplay amount={trip.price_sdg} />}
                    </div>
                  </div>
                  <Badge variant={trip.status === 'published' ? 'default' : 'secondary'}>
                    {trip.status === 'published' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" />{t('published')}</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" />{t('pending_payment')}</>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Link href="/carrier/trips/new" className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{t('postTrip')}</p>
                <p className="text-sm text-muted-foreground">{t('tripPendingMessage')}</p>
              </div>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Link href="/browse" className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{t('browse')}</p>
                <p className="text-sm text-muted-foreground">{t('availableRequests')}</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
