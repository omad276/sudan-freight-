'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getMyShipments, deleteShipment } from '@/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import {
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Shipment } from '@/types';

export default function ShipmentsPage() {
  const { t, language } = useLanguage();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    loadShipments();
  }, []);

  async function loadShipments() {
    setLoading(true);
    const result = await getMyShipments();
    if (result.data) {
      setShipments(result.data as Shipment[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return;

    const result = await deleteShipment(id);
    if (!result.error) {
      loadShipments();
    }
  }

  const filteredShipments = shipments.filter((s) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return s.status === 'pending_payment';
    if (activeTab === 'published') return s.status === 'published';
    return true;
  });

  const pendingCount = shipments.filter(s => s.status === 'pending_payment').length;
  const publishedCount = shipments.filter(s => s.status === 'published').length;

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('myRequests')}</h1>
        <Button asChild>
          <Link href="/shipper/new-shipment">
            <Plus className="h-4 w-4 ml-2" />
            {t('postCargoRequest')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4">
              <TabsList className="bg-transparent">
                <TabsTrigger value="all">
                  {t('all')} ({shipments.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  {t('pending_payment')} ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="published">
                  {t('published')} ({publishedCount})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              {filteredShipments.length === 0 ? (
                <EmptyState
                  icon="shipment"
                  title={t('noRequests')}
                  actionLabel={t('postCargoRequest')}
                  actionHref="/shipper/new-shipment"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('from')} - {t('to')}</TableHead>
                      <TableHead>{t('cargoType')}</TableHead>
                      <TableHead>{t('weight')}</TableHead>
                      <TableHead>{t('pickupDate')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell>
                          <Link
                            href={`/shipper/shipments/${shipment.id}`}
                            className="hover:underline font-medium"
                          >
                            {t(shipment.pickup_city as any)} → {t(shipment.dropoff_city as any)}
                          </Link>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/shipper/shipments/${shipment.id}`}>
                                  <Eye className="h-4 w-4 ml-2" />
                                  {t('view')}
                                </Link>
                              </DropdownMenuItem>
                              {shipment.status === 'pending_payment' && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(shipment.id)}
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  {t('delete')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
