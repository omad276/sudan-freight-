'use client';

import { useLanguage } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  amount: number;
  className?: string;
  showCurrency?: boolean;
}

export function PriceDisplay({
  amount,
  className = '',
  showCurrency = true,
}: PriceDisplayProps) {
  const { t } = useLanguage();

  return (
    <span className={className}>
      {formatPrice(amount)}
      {showCurrency && <span className="text-muted-foreground mr-1">{t('sdg')}</span>}
    </span>
  );
}
