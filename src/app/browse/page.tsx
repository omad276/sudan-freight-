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

          {/* Tabs - Rounded Pills */}
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('trips')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === 'trips'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Truck className="h-4 w-4" />
              {t('availableTrips')} ({trips.length})
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === 'shipments'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="h-4 w-4" />
              {t('availableRequests')} ({shipments.length})
            </button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="hidden" />

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">
            {t(trip.from_city as any)} → {t(trip.to_city as any)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(trip.trip_date, language)}
          </p>
        </div>
        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
          رحلة
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1 text-sm text-gray-600 mb-3">
        {trip.truck_type && (
          <p>{t(trip.truck_type as any)} {trip.capacity_tons && `· ${trip.capacity_tons} طن`}</p>
        )}
        {trip.price_sdg && (
          <p className="font-medium text-blue-600">
            <PriceDisplay amount={trip.price_sdg} />
          </p>
        )}
      </div>

      {/* Notes */}
      {trip.notes && (
        <p className="text-sm text-gray-500 border-t border-gray-100 pt-3 mb-3">
          {trip.notes}
        </p>
      )}

      {/* Carrier Info */}
      {trip.carrier && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">{trip.carrier.name}</p>
              {trip.carrier.company_name && (
                <p className="text-xs text-gray-500 truncate">{trip.carrier.company_name}</p>
              )}
            </div>
            {trip.carrier.email && (
              <a
                href={`mailto:${trip.carrier.email}`}
                className="text-xs text-blue-600 hover:underline"
              >
                تواصل
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">
            {t(shipment.pickup_city as any)} → {t(shipment.dropoff_city as any)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(shipment.pickup_date, language)}
          </p>
        </div>
        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
          شحنة
        </span>
      </div>

      {/* Details */}
      <div className="text-sm text-gray-600 mb-3">
        <p>{t(shipment.cargo_type as any)} · {shipment.weight_tons} طن</p>
      </div>

      {/* Description */}
      {shipment.description && (
        <p className="text-sm text-gray-500 border-t border-gray-100 pt-3 mb-3">
          {shipment.description}
        </p>
      )}

      {/* Shipper Info */}
      {shipment.shipper && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">{shipment.shipper.name}</p>
              {shipment.shipper.company_name && (
                <p className="text-xs text-gray-500 truncate">{shipment.shipper.company_name}</p>
              )}
            </div>
            {shipment.shipper.email && (
              <a
                href={`mailto:${shipment.shipper.email}`}
                className="text-xs text-blue-600 hover:underline"
              >
                تواصل
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
