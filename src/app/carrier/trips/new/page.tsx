'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { createTrip } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CitySelect, TruckTypeSelect } from '@/components/shared';
import { Truck, MapPin, Calendar } from 'lucide-react';

export default function NewTripPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [truckType, setTruckType] = useState('');
  const [capacityTons, setCapacityTons] = useState('');
  const [priceSdg, setPriceSdg] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await createTrip({
      from_city: fromCity,
      to_city: toCity,
      trip_date: tripDate,
      truck_type: truckType || undefined,
      capacity_tons: capacityTons ? parseFloat(capacityTons) : undefined,
      price_sdg: priceSdg ? parseFloat(priceSdg) : undefined,
      notes: notes || undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/carrier/trips?created=true');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('createTrip')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('from')} - {t('to')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CitySelect
                value={fromCity}
                onChange={setFromCity}
                label={t('fromCity')}
                required
              />
              <CitySelect
                value={toCity}
                onChange={setToCity}
                label={t('toCity')}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Trip Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t('tripDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TruckTypeSelect
                value={truckType}
                onChange={setTruckType}
                label={t('truckType')}
              />
              <div className="space-y-2">
                <Label htmlFor="capacityTons">{t('capacity')}</Label>
                <Input
                  id="capacityTons"
                  type="number"
                  step="0.1"
                  min="0"
                  value={capacityTons}
                  onChange={(e) => setCapacityTons(e.target.value)}
                  placeholder={t('capacityPlaceholder')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceSdg">{t('requestedPrice')} ({t('sdg')})</Label>
              <Input
                id="priceSdg"
                type="number"
                min="0"
                value={priceSdg}
                onChange={(e) => setPriceSdg(e.target.value)}
                placeholder={t('pricePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('tripDate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tripDate">
                {t('tripDate')}
                <span className="text-destructive mr-1">*</span>
              </Label>
              <Input
                id="tripDate"
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Notice */}
        <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
          {t('tripPendingMessage')}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={loading || !fromCity || !toCity || !tripDate}
            className="flex-1"
          >
            {loading ? t('loading') : t('postTrip')}
          </Button>
        </div>
      </form>
    </div>
  );
}
