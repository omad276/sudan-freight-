'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProfile, updateProfile } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CitySelect, RatingStars, LoadingSpinner } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Building2, MapPin, Calendar, Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/types';

export default function ShipperProfilePage() {
  const { t, language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const result = await getProfile();
    if (result.data) {
      setProfile(result.data as Profile);
      setName(result.data.name || '');
      setCompanyName(result.data.company_name || '');
      setCity(result.data.city || '');
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const result = await updateProfile({
      name,
      company_name: companyName || null,
      city: city || null,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(t('profileUpdated'));
    refreshProfile();
    loadProfile();
  }

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t('profile')}</h1>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profile')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile?.is_verified ? 'verified' : 'unverified'}>
                  {profile?.is_verified ? t('verified') : t('notVerified')}
                </Badge>
                <Badge variant="secondary">{t('shipper')}</Badge>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <RatingStars rating={profile?.avg_rating || 0} size="sm" />
              <span className="text-sm text-muted-foreground">
                ({profile?.rating_count || 0} reviews)
              </span>
            </div>
          </div>

          {/* Email (readonly) */}
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span dir="ltr">{profile?.email}</span>
          </div>

          {/* Member since */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>
              {t('memberSince')}: {formatDate(profile?.created_at || '', language)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editProfile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">{t('companyName')}</Label>
              <div className="relative">
                <Building2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('companyNamePlaceholder')}
                  className="pr-10"
                />
              </div>
            </div>

            <CitySelect
              value={city}
              onChange={setCity}
              label={t('city')}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-success">{success}</p>}

            <Button type="submit" disabled={saving || !name}>
              {saving ? t('loading') : t('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
