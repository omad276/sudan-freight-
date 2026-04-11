'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { getShipment, deleteShipment } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared';
import {
  MapPin,
  Package,
  Calendar,
  Scale,
  ArrowRight,
  Clock,
  CheckCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Shipment } from '@/types';

export default function ShipmentDetailPage() {
  const { t, language, isRTL } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadShipment();
  }, [shipmentId]);

  async function loadShipment() {
    setLoading(true);
    const result = await getShipment(shipmentId);
    if (result.data) {
      setShipment(result.data as Shipment);
    }
    setLoading(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteShipment(shipmentId);
    if (!result.error) {
      router.push('/shipper/shipments');
    }
    setDeleting(false);
    setDeleteDialogOpen(false);
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
    <div className="space-y-6 max-w-2xl mx-auto">
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
        <Button variant="outline" onClick={() => router.back()}>
          {t('back')}
        </Button>
      </div>

      {/* Pending Payment Notice */}
      {isPending && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-orange-600 shrink-0" />
              <div>
                <p className="font-medium text-orange-800">
                  {t('pending_payment')}
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  {t('requestPendingMessage')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Published Notice */}
      {isPublished && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <p className="font-medium text-green-800">
                  {t('published')}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {isRTL
                    ? 'طلبك منشور الآن ويمكن للناقلين رؤيته والتواصل معك'
                    : 'Your request is now published and carriers can see it and contact you'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('details')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
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
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">{t('description')}</p>
              <p>{shipment.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Info (if published) */}
      {isPublished && shipment.fee_amount && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('feeAmount')}</span>
              <span className="font-medium">{shipment.fee_amount} {t('sdg')}</span>
            </div>
            {shipment.fee_note && (
              <p className="text-sm text-muted-foreground mt-2">{shipment.fee_note}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isPending && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 ml-2" />
          {t('delete')}
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('confirmDelete')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t('actionCannotBeUndone')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t('loading') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
