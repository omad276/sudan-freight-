'use client';

import { useLanguage } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullPage?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({
  size = 'md',
  text,
  className,
  fullPage = false,
}: LoadingSpinnerProps) {
  const { t } = useLanguage();

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text !== undefined ? (
        text && <p className="text-sm text-muted-foreground">{text}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
        {content}
      </div>
    );
  }

  return content;
}
