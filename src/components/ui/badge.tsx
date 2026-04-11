'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-white',
        outline: 'border border-input bg-background text-foreground',
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
        // Shipment status variants
        pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        offered: 'bg-blue-100 text-blue-800 border border-blue-200',
        accepted: 'bg-green-100 text-green-800 border border-green-200',
        in_transit: 'bg-purple-100 text-purple-800 border border-purple-200',
        delivered: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
        completed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        cancelled: 'bg-red-100 text-red-800 border border-red-200',
        rejected: 'bg-red-100 text-red-800 border border-red-200',
        withdrawn: 'bg-gray-100 text-gray-800 border border-gray-200',
        // Truck status variants
        available: 'bg-green-100 text-green-800 border border-green-200',
        in_use: 'bg-blue-100 text-blue-800 border border-blue-200',
        maintenance: 'bg-orange-100 text-orange-800 border border-orange-200',
        inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
        // Verification status
        verified: 'bg-green-100 text-green-800 border border-green-200',
        unverified: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
