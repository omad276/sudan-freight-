'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to trips page - trucks are no longer managed separately
export default function TrucksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/carrier/trips');
  }, [router]);

  return null;
}
