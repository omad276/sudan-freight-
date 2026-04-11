'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { getShipment, publishShipment } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoadingSpinner, PriceDisplay } from '@/components/shared';
import {
  MapPin,
  Package,
  Calendar,
  Scale,
  User,
  Mail,
  Building2,
  ArrowRight,
  Clock,
  CheckCircle,
  Send,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Shipment } from '@/types';

export default function AdminShipmentDetailPage() {
  const { t, language, isRTL } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeNote, setFeeNote] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadShipment();
  }, [shipmentId]);

  async function loadShipment() {
    setLoading(true);
    const result = await getShipment(shipmentId);
    if (result.data) {
      setShipment(result.data as Shipment);
      setFeeAmount(result.data.fee_amount?.toString() || '');
      setFeeNote(result.data.fee_note || '');
    }
    setLoading(false);
  }

  async function handlePublish() {
    setPublishing(true);
    const result = await publishShipment(
      shipmentId,
      feeAmount ? parseFloat(feeAmount) : undefined,
      feeNote || undefined
    );
    setPublishing(false);
    if (!result.error) {
      setPublishDialogOpen(false);
      loadShipment();
    }
  }

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (!shipment) {
    return <div className="text-center py-12">{t('noData')}</div>;
  }

  const isPending = shipment.status === 'pending_payment';
  const isPublished = shipment.status === 'published';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {t(shipment.pickup_city as any)}
            <ArrowRight className="h-5 w-5" />
            {t(shipment.dropoff_city as any)}
          </h1>
          <Badge
            variant={isPublished ? 'default' : 'secondary'}
            className="mt-2"
          >
            {isPublished ? (
              <><CheckCircle className="h-3 w-3 mr-1" />{t('published')}</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" />{t('pending_payment')}</>
            )}
          </Badge>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <Button onClick={() => setPublishDialogOpen(true)}>
              <Send className="h-4 w-4 ml-2" />
              {t('publish')}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            {t('back')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Shipment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('details')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('from')}</p>
                  <p className="font-medium">{t(shipment.pickup_city as any)}</p>
                  {shipment.pickup_address && (
                    <p className="text-sm text-muted-foreground">{shipment.pickup_address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('to')}</p>
                  <p className="font-medium">{t(shipment.dropoff_city as any)}</p>
                  {shipment.dropoff_address && (
                    <p className="text-sm text-muted-foreground">{shipment.dropoff_address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('cargoType')}</p>
                  <p className="font-medium">{t(shipment.cargo_type as any)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('weight')}</p>
                  <p className="font-medium">{shipment.weight_tons} {t('ton')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('pickupDate')}</p>
                  <p className="font-medium">{formatDate(shipment.pickup_date, language)}</p>
                </div>
              </div>
            </div>

            {shipment.description && (
              <div className="md:col-span-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">{t('description')}</p>
                <p>{shipment.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipper Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('shipper')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{shipment.shipper?.name}</span>
            </div>
            {shipment.shipper?.company_name && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span>{shipment.shipper.company_name}</span>
              </div>
            )}
            {shipment.shipper?.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a
                  href={`mailto:${shipment.shipper.email}`}
                  className="text-primary hover:underline"
                >
                  {shipment.shipper.email}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fee Info (if published) */}
        {isPublished && shipment.fee_amount && (
          <Card>
            <CardHeader>
              <CardTitle>{t('feeAmount')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                <PriceDisplay amount={shipment.fee_amount} />
              </p>
              {shipment.fee_note && (
                <p className="text-muted-foreground mt-2">{shipment.fee_note}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('publishWithFee')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium flex items-center gap-2">
                {t(shipment.pickup_city as any)}
                <ArrowRight className="h-4 w-4" />
                {t(shipment.dropoff_city as any)}
              </p>
              <p className="text-sm text-muted-foreground">
                {shipment.shipper?.name} - {t(shipment.cargo_type as any)}
              </p>
            </div>
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
