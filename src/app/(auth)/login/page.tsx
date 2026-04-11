import { Header } from '@/components/layout/Header';
import { EmailLoginForm } from '@/components/auth/EmailLoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showAuthButtons={false} />
      <main className="flex-1 flex items-center justify-center p-4">
        <EmailLoginForm />
      </main>
    </div>
  );
}
