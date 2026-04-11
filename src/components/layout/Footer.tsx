'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Truck } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">{t('appName')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footerDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  {t('register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Shippers */}
          <div>
            <h3 className="font-semibold mb-4">{t('shipper')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  {t('createAccount')}
                </Link>
              </li>
              <li>
                <Link href="/shipper/new-shipment" className="hover:text-primary transition-colors">
                  {t('postCargoRequest')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Carriers */}
          <div>
            <h3 className="font-semibold mb-4">{t('carrier')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  {t('createAccount')}
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-primary transition-colors">
                  {t('browse')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} {t('appName')}. {t('allRightsReserved')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
