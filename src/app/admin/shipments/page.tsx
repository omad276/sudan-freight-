'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getAllShipments, publishShipment } from '@/actions';
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
  Eye,
  Send,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Shipment } from '@/types';

export default function AdminShipmentsPage() {
  const { t, language } = useLanguage();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeNote, setFeeNote] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const result = await getAllShipments();
    if (result.data) {
      setShipments(result.data as Shipment[]);
    }
    setLoading(false);
  }

  function openPublishDialog(shipment: Shipment) {
    setSelectedShipment(shipment);
    setFeeAmount(shipment.fee_amount?.toString() || '');
    setFeeNote(shipment.fee_note || '');
    setPublishDialogOpen(true);
  }

  async function handlePublish() {
    if (!selectedShipment) return;
    setPublishing(true);
    const result = await publishShipment(
      selectedShipment.id,
      feeAmount ? parseFloat(feeAmount) : undefined,
      feeNote || undefined
    );
    setPublishing(false);
    if (!result.error) {
      setPublishDialogOpen(false);
      setSelectedShipment(null);
      setFeeAmount('');
      setFeeNote('');
      loadData();
    }
  }

  const pendingShipments = shipments.filter(s => s.status === 'pending_payment');
  const publishedShipments = shipments.filter(s => s.status === 'published');

  const filteredShipments = shipments.filter((s) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return s.status === 'pending_payment';
    if (activeTab === 'published') return s.status === 'published';
    return true;
  });

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('cargoRequests')}</h1>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4 overflow-x-auto">
              <TabsList className="bg-transparent">
                <TabsTrigger value="all">
                  {t('all')} ({shipments.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  {t('pending_payment')} ({pendingShipments.length})
                </TabsTrigger>
                <TabsTrigger value="published">
                  {t('published')} ({publishedShipments.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              {filteredShipments.length === 0 ? (
                <EmptyState icon="shipment" title={t('noData')} />
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
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('feeAmount')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShipments.map((shipment) => (
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
                              {shipment.shipper?.email && (
                                <p className="text-sm text-muted-foreground">
                                  {shipment.shipper.email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{t(shipment.cargo_type as any)}</TableCell>
                          <TableCell>{shipment.weight_tons} {t('ton')}</TableCell>
                          <TableCell>{formatDate(shipment.pickup_date, language)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={shipment.status === 'published' ? 'default' : 'secondary'}
                            >
                              {shipment.status === 'published' ? (
                                <><CheckCircle className="h-3 w-3 mr-1" />{t('published')}</>
                              ) : (
                                <><Clock className="h-3 w-3 mr-1" />{t('pending_payment')}</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {shipment.fee_amount ? (
                              <PriceDisplay amount={shipment.fee_amount} />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/shipments/${shipment.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {shipment.status === 'pending_payment' && (
                                <Button
                                  size="sm"
                                  onClick={() => openPublishDialog(shipment)}
                                >
                                  <Send className="h-4 w-4 ml-1" />
                                  {t('publish')}
                                </Button>
                              )}
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

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('publishWithFee')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedShipment && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  {t(selectedShipment.pickup_city as any)}
                  <ArrowRight className="h-4 w-4" />
                  {t(selectedShipment.dropoff_city as any)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedShipment.shipper?.name} - {t(selectedShipment.cargo_type as any)}
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
