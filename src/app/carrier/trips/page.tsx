'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getMyTrips, deleteTrip } from '@/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState, PriceDisplay } from '@/components/shared';
import {
  Plus,
  MapPin,
  Calendar,
  Truck as TruckIcon,
  Trash2,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Trip } from '@/types';

function SuccessMessage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('created') === 'true';

  if (!showSuccess) return null;

  return (
    <div className="bg-green-500/10 text-green-600 p-4 rounded-lg">
      {t('tripCreated')}
    </div>
  );
}

function MyTripsContent() {
  const { t, language } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    setLoading(true);
    const result = await getMyTrips();
    if (result.data) {
      setTrips(result.data as Trip[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    setDeleting(id);
    await deleteTrip(id);
    loadTrips();
    setDeleting(null);
  }

  const pendingTrips = trips.filter(t => t.status === 'pending_payment');
  const publishedTrips = trips.filter(t => t.status === 'published');

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  const renderTripCard = (trip: Trip) => {
    const isPending = trip.status === 'pending_payment';

    return (
      <Card key={trip.id}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-medium">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {t(trip.from_city as any)}
                <ArrowRight className="h-4 w-4" />
                {t(trip.to_city as any)}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(trip.trip_date, language)}
                </span>
                {trip.truck_type && (
                  <span className="flex items-center gap-1">
                    <TruckIcon className="h-4 w-4" />
                    {t(trip.truck_type as any)}
                  </span>
                )}
                {trip.capacity_tons && (
                  <span>{trip.capacity_tons} {t('ton')}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isPending ? 'secondary' : 'default'}>
                  {isPending ? (
                    <><Clock className="h-3 w-3 mr-1" />{t('pending_payment')}</>
                  ) : (
                    <><CheckCircle className="h-3 w-3 mr-1" />{t('published')}</>
                  )}
                </Badge>
                {trip.price_sdg && (
                  <span className="font-bold">
                    <PriceDisplay amount={trip.price_sdg} />
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isPending && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(trip.id)}
                  disabled={deleting === trip.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {isPending && (
            <div className="mt-3 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              {t('tripPendingMessage')}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (trips.length === 0) {
    return (
      <EmptyState
        icon="truck"
        title={t('noTrips')}
        description={t('tripPendingMessage')}
        actionLabel={t('postTrip')}
        actionHref="/carrier/trips/new"
      />
    );
  }

  return (
    <div className="space-y-6">
      {pendingTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            {t('pending_payment')} ({pendingTrips.length})
          </h2>
          {pendingTrips.map(renderTripCard)}
        </div>
      )}

      {publishedTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            {t('published')} ({publishedTrips.length})
          </h2>
          {publishedTrips.map(renderTripCard)}
        </div>
      )}
    </div>
  );
}

export default function MyTripsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('myTrips')}</h1>
        <Button asChild>
          <Link href="/carrier/trips/new">
            <Plus className="h-4 w-4 ml-2" />
            {t('postTrip')}
          </Link>
        </Button>
      </div>

      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>

      <MyTripsContent />
    </div>
  );
}
