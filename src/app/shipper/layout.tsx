import { DashboardLayout } from '@/components/dashboard';

export default function ShipperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="shipper">{children}</DashboardLayout>;
}
