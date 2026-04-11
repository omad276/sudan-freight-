'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Check, X, Truck, Package, ArrowRight, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getPendingTrips, getPendingShipments } from '@/actions';
import { approveContent, rejectContent } from './actions';
import type { Trip, Shipment } from '@/types';

export default function AdminApprovalsPage() {
  const { t, language } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trips');

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'trip' | 'shipment'; id: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

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

  async function handleApprove(type: 'trip' | 'shipment', id: string) {
    setProcessing(true);
    const result = await approveContent(type, id);
    if (result.success) {
      loadData();
    } else {
      alert(result.error);
    }
    setProcessing(false);
  }

  function openRejectDialog(type: 'trip' | 'shipment', id: string) {
    setSelectedItem({ type, id });
    setRejectionReason('');
    setRejectDialogOpen(true);
  }

  async function handleReject() {
    if (!selectedItem) return;
    if (!rejectionReason.trim()) {
      alert(t('pleaseEnterReason') || 'Please enter a rejection reason');
      return;
    }

    setProcessing(true);
    const result = await rejectContent(selectedItem.type, selectedItem.id, rejectionReason);
    if (result.success) {
      setRejectDialogOpen(false);
      setSelectedItem(null);
      setRejectionReason('');
      loadData();
    } else {
      alert(result.error);
    }
    setProcessing(false);
  }

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('approvalRequests') || 'Approval Requests'}</h1>

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
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('actions')}</TableHead>
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
                          <TableCell className="text-muted-foreground">
                            {formatDate(trip.created_at, language)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove('trip', trip.id)}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog('trip', trip.id)}
                                disabled={processing}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
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
                        <TableHead>{t('actions')}</TableHead>
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
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove('shipment', shipment.id)}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectDialog('shipment', shipment.id)}
                                disabled={processing}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectionReason') || 'Rejection Reason'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">{t('reason') || 'Reason'}</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('enterRejectionReason') || 'Enter rejection reason...'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? t('loading') : t('confirmReject') || 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
