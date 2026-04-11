'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to pending page - payments are now handled as listing fees
export default function PaymentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/pending');
  }, [router]);

  return null;
}
