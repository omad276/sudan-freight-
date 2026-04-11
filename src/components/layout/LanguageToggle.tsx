'use client';

import { useLanguage } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="ltr-only">{language === 'ar' ? 'EN' : 'عربي'}</span>
    </Button>
  );
}
