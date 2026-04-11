'use client';

import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Package, Truck, Users, FileText } from 'lucide-react';
import Link from 'next/link';

type IconType = 'shipment' | 'truck' | 'user' | 'document';

const icons: Record<IconType, React.ElementType> = {
  shipment: Package,
  truck: Truck,
  user: Users,
  document: FileText,
};

interface EmptyStateProps {
  icon?: IconType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'document',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const { t } = useLanguage();

  const Icon = icons[icon];
  const displayTitle = title || t('noData');
  const displayDescription = description || t('noResultsFound');

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{displayTitle}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{displayDescription}</p>
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </div>
  );
}
