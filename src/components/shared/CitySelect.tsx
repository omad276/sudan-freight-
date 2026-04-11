'use client';

import { useId } from 'react';
import { useLanguage, SUDAN_CITIES } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CitySelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
}: CitySelectProps) {
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
          <SelectValue placeholder={placeholder || t('selectCity')} />
        </SelectTrigger>
        <SelectContent>
          {SUDAN_CITIES.map((city) => (
            <SelectItem key={city} value={city}>
              {t(city as any)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
