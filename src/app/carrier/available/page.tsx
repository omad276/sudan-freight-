'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to public browse page
export default function AvailableShipmentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/browse');
  }, [router]);

  return null;
}
