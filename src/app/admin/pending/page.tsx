'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { getPendingTrips, getPendingShipments, publishTrip, publishShipment } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Send, Truck, Package, ArrowRight, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Trip, Shipment } from '@/types';

export default function AdminPendingPage() {
  const { t, language } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trips');

  // Publish dialog
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Trip | Shipment | null>(null);
  const [itemType, setItemType] = useState<'trip' | 'shipment'>('trip');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeNote, setFeeNote] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [tripsResult, shipmentsResult] = await Promise.all([
      getPendingTrips(),
      getPendingShipments(),
    ]);
    if (tripsResult.data) setTrips(tripsResult.data as Trip[]);
    if (shipmentsResult.data) setShipments(shipmentsResult.data as Shipment[]);
    setLoading(false);
  }

  function openPublishDialog(item: Trip | Shipment, type: 'trip' | 'shipment') {
    setSelectedItem(item);
    setItemType(type);
    setFeeAmount(item.fee_amount?.toString() || '');
    setFeeNote(item.fee_note || '');
    setPublishDialogOpen(true);
  }

  async function handlePublish() {
    if (!selectedItem) return;
    setPublishing(true);

    const fee = feeAmount ? parseFloat(feeAmount) : undefined;
    const note = feeNote || undefined;

    if (itemType === 'trip') {
      await publishTrip(selectedItem.id, fee, note);
    } else {
      await publishShipment(selectedItem.id, fee, note);
    }

    setPublishing(false);
    setPublishDialogOpen(false);
    setSelectedItem(null);
    setFeeAmount('');
    setFeeNote('');
    loadData();
  }

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('pendingListings')}</h1>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4">
              <TabsList className="bg-transparent">
                <TabsTrigger value="trips" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {t('pendingTrips')} ({trips.length})
                </TabsTrigger>
                <TabsTrigger value="shipments" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('pendingCargoRequests')} ({shipments.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Pending Trips */}
            <TabsContent value="trips" className="m-0">
              {trips.length === 0 ? (
                <EmptyState icon="truck" title={t('noPendingListings')} />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('from')} - {t('to')}</TableHead>
                        <TableHead>{t('carrier')}</TableHead>
                        <TableHead>{t('tripDate')}</TableHead>
                        <TableHead>{t('truckType')}</TableHead>
                        <TableHead>{t('requestedPrice')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>
                            <div className="flex items-center gap-2 font-medium">
                              {t(trip.from_city as any)}
                              <ArrowRight className="h-4 w-4" />
                              {t(trip.to_city as any)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{trip.carrier?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {trip.carrier?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(trip.trip_date, language)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {trip.truck_type ? t(trip.truck_type as any) : '-'}
                          </TableCell>
                          <TableCell>
                            {trip.price_sdg ? `${trip.price_sdg} ${t('sdg')}` : '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(trip.created_at, language)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => openPublishDialog(trip, 'trip')}
                            >
                              <Send className="h-4 w-4 ml-1" />
                              {t('publish')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Pending Shipments */}
            <TabsContent value="shipments" className="m-0">
              {shipments.length === 0 ? (
                <EmptyState icon="shipment" title={t('noPendingListings')} />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('from')} - {t('to')}</TableHead>
                        <TableHead>{t('shipper')}</TableHead>
                        <TableHead>{t('cargoType')}</TableHead>
                        <TableHead>{t('weight')}</TableHead>
                        <TableHead>{t('pickupDate')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2 font-medium">
                              {t(shipment.pickup_city as any)}
                              <ArrowRight className="h-4 w-4" />
                              {t(shipment.dropoff_city as any)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{shipment.shipper?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {shipment.shipper?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{t(shipment.cargo_type as any)}</TableCell>
                          <TableCell>{shipment.weight_tons} {t('ton')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(shipment.pickup_date, language)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(shipment.created_at, language)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => openPublishDialog(shipment, 'shipment')}
                            >
                              <Send className="h-4 w-4 ml-1" />
                              {t('publish')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('publishWithFee')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedItem && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  {itemType === 'trip' ? (
                    <>
                      {t((selectedItem as Trip).from_city as any)}
                      <ArrowRight className="h-4 w-4" />
                      {t((selectedItem as Trip).to_city as any)}
                    </>
                  ) : (
                    <>
                      {t((selectedItem as Shipment).pickup_city as any)}
                      <ArrowRight className="h-4 w-4" />
                      {t((selectedItem as Shipment).dropoff_city as any)}
                    </>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {itemType === 'trip'
                    ? (selectedItem as Trip).carrier?.name
                    : (selectedItem as Shipment).shipper?.name}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="feeAmount">{t('feeAmount')} ({t('sdg')})</Label>
              <Input
                id="feeAmount"
                type="number"
                placeholder={t('feeAmountPlaceholder')}
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeNote">{t('feeNote')}</Label>
              <Input
                id="feeNote"
                placeholder={t('feeNotePlaceholder')}
                value={feeNote}
                onChange={(e) => setFeeNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? t('loading') : t('confirmPayment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
