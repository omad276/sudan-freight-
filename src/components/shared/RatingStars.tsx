'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  editable?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function RatingStars({
  rating,
  maxRating = 5,
  editable = false,
  onChange,
  size = 'md',
  showValue = false,
}: RatingStarsProps) {
  const handleClick = (value: number) => {
    if (editable && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1;
        const filled = value <= rating;
        const halfFilled = !filled && value - 0.5 <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!editable}
            onClick={() => handleClick(value)}
            className={cn(
              'transition-colors',
              editable && 'cursor-pointer hover:scale-110',
              !editable && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : halfFilled
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'fill-transparent text-muted-foreground'
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="text-sm text-muted-foreground mr-2">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}
