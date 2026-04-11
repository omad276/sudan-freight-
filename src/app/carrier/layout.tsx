import { DashboardLayout } from '@/components/dashboard';

export default function CarrierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="carrier">{children}</DashboardLayout>;
}
