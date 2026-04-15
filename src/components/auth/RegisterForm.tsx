'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useLanguage, SUDAN_CITIES } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Lock, User, Building2, Truck, Package } from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/types';

type Step = 'credentials' | 'profile';

export function RegisterForm() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCompleting = searchParams.get('complete') === 'true';

  const supabase = createBrowserClient();

  const [step, setStep] = useState<Step>(isCompleting ? 'profile' : 'credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<'shipper' | 'carrier' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Profile is created automatically by database trigger (on_auth_user_created)
        // Proceed to profile completion step
        setStep('profile');
      }
    } catch (err: any) {
      setError(err?.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name,
        company_name: companyName || null,
        city: city || null,
        role: role as UserRole,
      }, { onConflict: 'id' });

      if (error) throw error;

      if (role === 'shipper') {
        router.push('/shipper/dashboard');
      } else {
        router.push('/carrier/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('createAccount')}</CardTitle>
        <CardDescription>{t('joinPlatform')}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'credentials' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-4 pr-10"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-4 pr-10"
                  dir="ltr"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-4 pr-10"
                  dir="ltr"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loading') : t('next')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('alreadyHaveAccount')}{' '}
              <Link href="/login" className="text-primary hover:underline">
                {t('login')}
              </Link>
            </p>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              <span className="text-sm font-medium leading-none">{t('selectRole')}</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('shipper')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    role === 'shipper'
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <Package className={`h-8 w-8 mx-auto mb-2 ${role === 'shipper' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`font-medium ${role === 'shipper' ? 'text-primary' : ''}`}>
                    {t('shipper')}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('carrier')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    role === 'carrier'
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <Truck className={`h-8 w-8 mx-auto mb-2 ${role === 'carrier' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`font-medium ${role === 'carrier' ? 'text-primary' : ''}`}>
                    {t('carrier')}
                  </p>
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" required>{t('name')}</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            {/* Company Name (optional) */}
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('companyName')}</Label>
              <div className="relative">
                <Building2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder={t('companyNamePlaceholder')}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">{t('city')}</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger id="city">
                  <SelectValue placeholder={t('selectCity')} />
                </SelectTrigger>
                <SelectContent>
                  {SUDAN_CITIES.map((cityKey) => (
                    <SelectItem key={cityKey} value={cityKey}>
                      {t(cityKey as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !role || !name}
            >
              {loading ? t('loading') : t('completeRegistration')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
