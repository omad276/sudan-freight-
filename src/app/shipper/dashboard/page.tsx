'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthProvider';
import { getShipperStats, getMyShipments } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import {
  Package,
  Clock,
  CheckCircle,
  Plus,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { ShipperStats, Shipment } from '@/types';

export default function ShipperDashboardPage() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [stats, setStats] = useState<ShipperStats | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsResult, shipmentsResult] = await Promise.all([
        getShipperStats(),
        getMyShipments(),
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (shipmentsResult.data) setShipments((shipmentsResult.data as Shipment[]).slice(0, 5));
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  const statCards = [
    {
      title: t('cargoRequests'),
      value: stats?.total_requests || 0,
      icon: Package,
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
          <Link href="/shipper/new-shipment">
            <Plus className="h-4 w-4 ml-2" />
            {t('postCargoRequest')}
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

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('myRequests')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shipper/shipments">
              {t('view')} {t('all')}
              <ArrowLeft className="h-4 w-4 mr-2 rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {shipments.length === 0 ? (
            <EmptyState
              icon="shipment"
              title={t('noRequests')}
              description={t('requestPendingMessage')}
              actionLabel={t('postCargoRequest')}
              actionHref="/shipper/new-shipment"
            />
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {t(shipment.pickup_city as any)}
                      <ArrowRight className="h-4 w-4" />
                      {t(shipment.dropoff_city as any)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{t(shipment.cargo_type as any)}</span>
                      <span>{shipment.weight_tons} {t('ton')}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(shipment.pickup_date, language)}
                      </span>
                    </div>
                  </div>
                  <Badge variant={shipment.status === 'published' ? 'default' : 'secondary'}>
                    {shipment.status === 'published' ? (
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
            <Link href="/shipper/new-shipment" className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{t('postCargoRequest')}</p>
                <p className="text-sm text-muted-foreground">{t('requestPendingMessage')}</p>
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
                <p className="text-sm text-muted-foreground">{t('availableTrips')}</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
