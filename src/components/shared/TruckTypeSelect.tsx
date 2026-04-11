'use client';

import { useId } from 'react';
import { useLanguage, TRUCK_TYPES } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TruckTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TruckTypeSelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
}: TruckTypeSelectProps) {
  const { t } = useLanguage();
  const id = useId();

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder || t('selectTruckType')} />
        </SelectTrigger>
        <SelectContent>
          {TRUCK_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {t(type as any)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
