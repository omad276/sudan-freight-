'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: Clock,
      title: t('easyBooking'),
      description: t('easyBookingDesc'),
    },
    {
      icon: Shield,
      title: t('verifiedCarriers'),
      description: t('verifiedCarriersDesc'),
    },
    {
      icon: MapPin,
      title: t('directContact'),
      description: t('directContactDesc'),
    },
    {
      icon: CreditCard,
      title: t('securePayments'),
      description: t('securePaymentsDesc'),
    },
  ];

  const stats = [
    { value: '500+', label: isRTL ? 'شحنات' : 'Shipments' },
    { value: '100+', label: isRTL ? 'ناقل نشط' : 'Active Carriers' },
    { value: '15', label: isRTL ? 'مدينة' : 'Cities' },
    { value: '98%', label: isRTL ? 'رضا العملاء' : 'Satisfied' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary/80 text-white py-20 md:py-32">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="text-lg">
                  <Link href="/register">
                    {t('getStarted')}
                    <ArrowLeft className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2 rotate-180'}`} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg bg-white/10 border-white/30 hover:bg-white/20">
                  <Link href="#features">{t('learnMore')}</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted/50">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {t('features')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {isRTL ? 'كيف يعمل' : 'How It Works'}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* For Shippers */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{t('shipper')}</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'سجل حساب مجاني' : 'Register a free account'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'أنشئ طلب شحن' : 'Post your cargo request'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'ادفع رسوم النشر للمدير' : 'Pay listing fee to admin'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'تواصل مباشرة مع الناقلين' : 'Connect directly with carriers'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* For Carriers */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{t('carrier')}</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'سجل حسابك' : 'Register your account'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'انشر رحلتك المتاحة' : 'Post your available trip'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'ادفع رسوم النشر للمدير' : 'Pay listing fee to admin'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'تواصل مع أصحاب البضائع' : 'Connect with cargo owners'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Trust & Security */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{isRTL ? 'الأمان والثقة' : 'Trust & Security'}</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'جميع الإعلانات موثقة' : 'All listings are verified'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'تواصل مباشر بين المستخدمين' : 'Direct contact between users'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'دفع كاش آمن' : 'Secure cash payments'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span>{isRTL ? 'دعم على مدار الساعة' : '24/7 support'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Browse CTA */}
            <div className="text-center mt-8">
              <Button size="lg" asChild>
                <Link href="/browse">
                  {isRTL ? 'تصفح الإعلانات المتاحة' : 'Browse Available Listings'}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? 'ابدأ اليوم' : 'Start Today'}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {isRTL
                ? 'انضم إلى واصل وابدأ في توصيل أو شحن بضائعك بسهولة'
                : 'Join Wassel and start delivering or shipping your goods with ease'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  <Package className="h-5 w-5 ml-2" />
                  {isRTL ? 'سجل كشاحن' : 'Register as Shipper'}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white/10 border-white/30 hover:bg-white/20">
                <Link href="/register">
                  <Truck className="h-5 w-5 ml-2" />
                  {isRTL ? 'سجل كناقل' : 'Register as Carrier'}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
