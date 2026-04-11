'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { getAllTrips, publishTrip } from '@/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoadingSpinner, EmptyState, PriceDisplay } from '@/components/shared';
import {
  Send,
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar,
  Truck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Trip } from '@/types';

export default function AdminTripsPage() {
  const { t, language } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeNote, setFeeNote] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const result = await getAllTrips();
    if (result.data) {
      setTrips(result.data as Trip[]);
    }
    setLoading(false);
  }

  function openPublishDialog(trip: Trip) {
    setSelectedTrip(trip);
    setFeeAmount(trip.fee_amount?.toString() || '');
    setFeeNote(trip.fee_note || '');
    setPublishDialogOpen(true);
  }

  async function handlePublish() {
    if (!selectedTrip) return;
    setPublishing(true);
    const result = await publishTrip(
      selectedTrip.id,
      feeAmount ? parseFloat(feeAmount) : undefined,
      feeNote || undefined
    );
    setPublishing(false);
    if (!result.error) {
      setPublishDialogOpen(false);
      setSelectedTrip(null);
      setFeeAmount('');
      setFeeNote('');
      loadData();
    }
  }

  const pendingTrips = trips.filter(t => t.status === 'pending_payment');
  const publishedTrips = trips.filter(t => t.status === 'published');

  const filteredTrips = trips.filter((t) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return t.status === 'pending_payment';
    if (activeTab === 'published') return t.status === 'published';
    return true;
  });

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('trips')}</h1>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4 overflow-x-auto">
              <TabsList className="bg-transparent">
                <TabsTrigger value="all">
                  {t('all')} ({trips.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  {t('pending_payment')} ({pendingTrips.length})
                </TabsTrigger>
                <TabsTrigger value="published">
                  {t('published')} ({publishedTrips.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              {filteredTrips.length === 0 ? (
                <EmptyState icon="truck" title={t('noTrips')} />
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
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('feeAmount')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrips.map((trip) => (
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
                              {trip.carrier?.email && (
                                <p className="text-sm text-muted-foreground">
                                  {trip.carrier.email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(trip.trip_date, language)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {trip.truck_type ? (
                              <div className="flex items-center gap-1">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                {t(trip.truck_type as any)}
                                {trip.capacity_tons && (
                                  <span className="text-muted-foreground">
                                    ({trip.capacity_tons} {t('ton')})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {trip.price_sdg ? (
                              <PriceDisplay amount={trip.price_sdg} />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={trip.status === 'published' ? 'default' : 'secondary'}
                            >
                              {trip.status === 'published' ? (
                                <><CheckCircle className="h-3 w-3 mr-1" />{t('published')}</>
                              ) : (
                                <><Clock className="h-3 w-3 mr-1" />{t('pending_payment')}</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {trip.fee_amount ? (
                              <PriceDisplay amount={trip.fee_amount} />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {trip.status === 'pending_payment' && (
                              <Button
                                size="sm"
                                onClick={() => openPublishDialog(trip)}
                              >
                                <Send className="h-4 w-4 ml-1" />
                                {t('publish')}
                              </Button>
                            )}
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
            {selectedTrip && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  {t(selectedTrip.from_city as any)}
                  <ArrowRight className="h-4 w-4" />
                  {t(selectedTrip.to_city as any)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTrip.carrier?.name}
                  {selectedTrip.truck_type && ` - ${t(selectedTrip.truck_type as any)}`}
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
            <Button
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing ? t('loading') : t('confirmPayment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
