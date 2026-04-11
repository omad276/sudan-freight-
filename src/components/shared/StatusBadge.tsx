'use client';

import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import type { ListingStatus } from '@/types';

type StatusType = ListingStatus | 'verified' | 'unverified';

interface StatusBadgeProps {
  status: StatusType;
}

const statusVariantMap: Record<StatusType, string> = {
  // Listing statuses
  pending_payment: 'secondary',
  published: 'default',
  completed: 'completed',
  cancelled: 'destructive',
  // Verification statuses
  verified: 'default',
  unverified: 'secondary',
};

const statusTranslationMap: Record<StatusType, string> = {
  pending_payment: 'pending_payment',
  published: 'published',
  completed: 'completed',
  cancelled: 'cancelled',
  verified: 'verified',
  unverified: 'notVerified',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLanguage();

  const variant = statusVariantMap[status] || 'default';
  const translationKey = statusTranslationMap[status] || status;

  return (
    <Badge variant={variant as any}>
      {t(translationKey as any)}
    </Badge>
  );
}
