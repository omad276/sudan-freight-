'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to trips/new - trucks are managed within trips
export default function NewTruckPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/carrier/trips/new');
  }, [router]);

  return null;
}
