'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { createShipment } from '@/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CitySelect, CargoTypeSelect } from '@/components/shared';
import { Package, MapPin, Calendar, Scale } from 'lucide-react';
import type { CargoType } from '@/types';

export default function NewShipmentPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [pickupCity, setPickupCity] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffCity, setDropoffCity] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [weightTons, setWeightTons] = useState('');
  const [description, setDescription] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await createShipment({
      pickup_city: pickupCity,
      pickup_address: pickupAddress || undefined,
      dropoff_city: dropoffCity,
      dropoff_address: dropoffAddress || undefined,
      cargo_type: cargoType as CargoType,
      weight_tons: parseFloat(weightTons),
      description: description || undefined,
      pickup_date: pickupDate,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/shipper/shipments');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('createCargoRequest')}</h1>

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
                value={pickupCity}
                onChange={setPickupCity}
                label={t('pickupCity')}
                required
              />
              <CitySelect
                value={dropoffCity}
                onChange={setDropoffCity}
                label={t('dropoffCity')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">{t('pickupAddress')}</Label>
              <Input
                id="pickupAddress"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder={t('pickupAddressPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoffAddress">{t('dropoffAddress')}</Label>
              <Input
                id="dropoffAddress"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder={t('dropoffAddressPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cargo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('cargoType')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CargoTypeSelect
                value={cargoType}
                onChange={setCargoType}
                label={t('cargoType')}
                required
              />
              <div className="space-y-2">
                <Label htmlFor="weightTons">
                  {t('weightTons')}
                  <span className="text-destructive mr-1">*</span>
                </Label>
                <div className="relative">
                  <Scale className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="weightTons"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={weightTons}
                    onChange={(e) => setWeightTons(e.target.value)}
                    placeholder={t('weightPlaceholder')}
                    className="pr-10"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
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
              {t('pickupDate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="pickupDate">
                {t('pickupDate')}
                <span className="text-destructive mr-1">*</span>
              </Label>
              <Input
                id="pickupDate"
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </CardContent>
        </Card>

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
            disabled={loading || !pickupCity || !dropoffCity || !cargoType || !weightTons || !pickupDate}
            className="flex-1"
          >
            {loading ? t('loading') : t('submitRequest')}
          </Button>
        </div>
      </form>
    </div>
  );
}
