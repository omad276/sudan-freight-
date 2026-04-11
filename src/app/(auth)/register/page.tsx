import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showAuthButtons={false} />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
