'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getPublishedTrips, getPublishedShipments } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CitySelect } from '@/components/shared/CitySelect';
import { LoadingSpinner, EmptyState, PriceDisplay } from '@/components/shared';
import {
  Truck,
  Package,
  MapPin,
  ArrowRight,
  Calendar,
  Weight,
  Mail,
  Building2,
  Filter,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Trip, Shipment } from '@/types';

export default function BrowsePage() {
  const { t, language, isRTL } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trips');

  // Filters
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [fromCity, toCity]);

  async function loadData() {
    setLoading(true);

    const tripFilters = {
      from_city: fromCity || undefined,
      to_city: toCity || undefined,
    };

    const shipmentFilters = {
      pickup_city: fromCity || undefined,
      dropoff_city: toCity || undefined,
    };

    const [tripsResult, shipmentsResult] = await Promise.all([
      getPublishedTrips(tripFilters),
      getPublishedShipments(shipmentFilters),
    ]);

    if (tripsResult.data) setTrips(tripsResult.data as Trip[]);
    if (shipmentsResult.data) setShipments(shipmentsResult.data as Shipment[]);
    setLoading(false);
  }

  function clearFilters() {
    setFromCity('');
    setToCity('');
  }

  const hasFilters = fromCity || toCity;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{t('browse')}</h1>
              <p className="text-muted-foreground">
                {isRTL
                  ? 'تصفح الرحلات وطلبات الشحن المتاحة'
                  : 'Browse available trips and cargo requests'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-fit"
            >
              <Filter className="h-4 w-4 ml-2" />
              {t('filter')}
              {hasFilters && (
                <Badge variant="secondary" className="mr-2">
                  {(fromCity ? 1 : 0) + (toCity ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <CitySelect
                    value={fromCity}
                    onChange={setFromCity}
                    placeholder={t('fromCity')}
                    label={t('from')}
                  />
                  <CitySelect
                    value={toCity}
                    onChange={setToCity}
                    placeholder={t('toCity')}
                    label={t('to')}
                  />
                  <div className="flex items-end">
                    {hasFilters && (
                      <Button variant="ghost" onClick={clearFilters}>
                        <X className="h-4 w-4 ml-1" />
                        {isRTL ? 'مسح الفلتر' : 'Clear'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="trips" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                {t('availableTrips')} ({trips.length})
              </TabsTrigger>
              <TabsTrigger value="shipments" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('availableRequests')} ({shipments.length})
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <LoadingSpinner className="py-12" />
            ) : (
              <>
                {/* Trips Tab */}
                <TabsContent value="trips">
                  {trips.length === 0 ? (
                    <EmptyState
                      icon="truck"
                      title={t('noTrips')}
                      description={isRTL
                        ? 'لا توجد رحلات متاحة حالياً'
                        : 'No trips available at the moment'}
                    />
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Shipments Tab */}
                <TabsContent value="shipments">
                  {shipments.length === 0 ? (
                    <EmptyState
                      icon="shipment"
                      title={t('noRequests')}
                      description={isRTL
                        ? 'لا توجد طلبات شحن متاحة حالياً'
                        : 'No cargo requests available at the moment'}
                    />
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {shipments.map((shipment) => (
                        <ShipmentCard key={shipment.id} shipment={shipment} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const { t, language, isRTL } = useLanguage();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="h-5 w-5 text-primary" />
            {t(trip.from_city as any)}
            <ArrowRight className="h-4 w-4" />
            {t(trip.to_city as any)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trip Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(trip.trip_date, language)}</span>
          </div>
          {trip.truck_type && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>{t(trip.truck_type as any)}</span>
              {trip.capacity_tons && (
                <span className="text-muted-foreground">
                  ({trip.capacity_tons} {t('ton')})
                </span>
              )}
            </div>
          )}
          {trip.price_sdg && (
            <div className="font-medium text-primary">
              <PriceDisplay amount={trip.price_sdg} />
            </div>
          )}
        </div>

        {/* Notes */}
        {trip.notes && (
          <p className="text-sm text-muted-foreground border-t pt-3">
            {trip.notes}
          </p>
        )}

        {/* Carrier Info */}
        {trip.carrier && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{trip.carrier.name}</p>
                {trip.carrier.company_name && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {trip.carrier.company_name}
                  </p>
                )}
                {trip.carrier.email && (
                  <a
                    href={`mailto:${trip.carrier.email}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Mail className="h-3 w-3" />
                    {t('contactCarrier')}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const { t, language, isRTL } = useLanguage();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="h-5 w-5 text-primary" />
            {t(shipment.pickup_city as any)}
            <ArrowRight className="h-4 w-4" />
            {t(shipment.dropoff_city as any)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shipment Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(shipment.pickup_date, language)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t(shipment.cargo_type as any)}</Badge>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Weight className="h-4 w-4" />
              {shipment.weight_tons} {t('ton')}
            </span>
          </div>
        </div>

        {/* Description */}
        {shipment.description && (
          <p className="text-sm text-muted-foreground border-t pt-3">
            {shipment.description}
          </p>
        )}

        {/* Shipper Info */}
        {shipment.shipper && (
          <div className="border-t pt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{shipment.shipper.name}</p>
                {shipment.shipper.company_name && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {shipment.shipper.company_name}
                  </p>
                )}
                {shipment.shipper.email && (
                  <a
                    href={`mailto:${shipment.shipper.email}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Mail className="h-3 w-3" />
                    {t('contactShipper')}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
