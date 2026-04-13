'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthProvider';
import { getShipperStats, getMyShipments } from '@/actions';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { ShipperStats, Shipment } from '@/types';

export default function ShipperDashboardPage() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [stats, setStats] = useState<ShipperStats | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsResult, shipmentsResult] = await Promise.all([
        getShipperStats(),
        getMyShipments(),
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (shipmentsResult.data) setShipments((shipmentsResult.data as Shipment[]).slice(0, 5));
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {t('welcomeBack')}، {profile?.name?.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('appDescription')}</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{stats?.published || 0}</p>
          <p className="text-sm text-gray-500 mt-1">منشور</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-orange-600">{stats?.pending_payment || 0}</p>
          <p className="text-sm text-gray-500 mt-1">في انتظار الدفع</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{stats?.total_requests || 0}</p>
          <p className="text-sm text-gray-500 mt-1">طلبات الشحن</p>
        </div>
      </div>

      {/* My Shipments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">طلباتي</h2>
          <Link href="/shipper/shipments" className="text-sm text-blue-600 hover:text-blue-700">
            عرض الكل ←
          </Link>
        </div>

        {shipments.length === 0 ? (
          <EmptyState
            icon="shipment"
            title={t('noRequests')}
            description={t('requestPendingMessage')}
            actionLabel={t('postCargoRequest')}
            actionHref="/shipper/new-shipment"
          />
        ) : (
          <div className="space-y-3">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {t(shipment.pickup_city as any)} → {t(shipment.dropoff_city as any)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(shipment.pickup_date, language)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {shipment.weight_tons} طن · {t(shipment.cargo_type as any)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(shipment.status)}`}>
                      {getStatusLabel(shipment.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action Button */}
      <div className="text-center">
        <Link
          href="/shipper/new-shipment"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition font-medium"
        >
          + نشر طلب شحن
        </Link>
        <p className="text-xs text-gray-500 mt-3">
          طلبك قيد الانتظار - سيتواصل معك المدير لتأكيد الدفع
        </p>
      </div>
    </div>
  );
}
