'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getMyShipments, deleteShipment } from '@/actions';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import {
  Plus,
  Trash2,
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'في انتظار الدفع';
      case 'published': return 'منشور';
      case 'in_transit': return 'قيد التوصيل';
      case 'delivered': return 'تم التوصيل';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-orange-100 text-orange-700';
      case 'published': return 'bg-green-100 text-green-700';
      case 'in_transit': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('myRequests')}</h1>
        <Link
          href="/shipper/new-shipment"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="h-4 w-4 ml-2" />
          {t('postCargoRequest')}
        </Link>
      </div>

      {/* Filter Tabs - Rounded Pills */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الكل ({shipments.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          في انتظار الدفع ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            activeTab === 'published'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          منشور ({publishedCount})
        </button>
      </div>

      {/* Shipments List - Cards */}
      {filteredShipments.length === 0 ? (
        <EmptyState
          icon="shipment"
          title={t('noRequests')}
          actionLabel={t('postCargoRequest')}
          actionHref="/shipper/new-shipment"
        />
      ) : (
        <div className="space-y-3">
          {filteredShipments.map((shipment) => (
            <div
              key={shipment.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/shipper/shipments/${shipment.id}`}
                    className="font-semibold text-gray-800 hover:text-blue-600 transition"
                  >
                    {t(shipment.pickup_city as any)} → {t(shipment.dropoff_city as any)}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {t(shipment.cargo_type as any)} · {shipment.weight_tons} طن
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(shipment.pickup_date, language)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(shipment.status)}`}>
                    {getStatusLabel(shipment.status)}
                  </span>
                  {shipment.status === 'pending_payment' && (
                    <button
                      onClick={() => handleDelete(shipment.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
