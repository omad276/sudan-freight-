'use server';

import { createClient } from '@/lib/supabase/server';
import type { ShipperStats, CarrierStats, AdminStats } from '@/types';

export async function getShipperStats(): Promise<{ data?: ShipperStats; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { data: shipments, error } = await supabase
    .from('shipments')
    .select('status')
    .eq('shipper_id', user.id);

  if (error) {
    return { error: error.message };
  }

  const stats: ShipperStats = {
    total_requests: shipments?.length || 0,
    pending_payment: shipments?.filter(s => s.status === 'pending_payment').length || 0,
    published: shipments?.filter(s => s.status === 'published').length || 0,
  };

  return { data: stats };
}

export async function getCarrierStats(): Promise<{ data?: CarrierStats; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { data: trips, error } = await supabase
    .from('trips')
    .select('status')
    .eq('carrier_id', user.id);

  if (error) {
    return { error: error.message };
  }

  const stats: CarrierStats = {
    total_trips: trips?.length || 0,
    pending_payment: trips?.filter(t => t.status === 'pending_payment').length || 0,
    published: trips?.filter(t => t.status === 'published').length || 0,
  };

  return { data: stats };
}

export async function getAdminStats(): Promise<{ data?: AdminStats; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  // Get all counts in parallel
  const [usersResult, tripsResult, shipmentsResult] = await Promise.all([
    supabase.from('profiles').select('role'),
    supabase.from('trips').select('status, is_published'),
    supabase.from('shipments').select('status, is_published'),
  ]);

  const users = usersResult.data || [];
  const trips = tripsResult.data || [];
  const shipments = shipmentsResult.data || [];

  const stats: AdminStats = {
    total_users: users.length,
    total_shippers: users.filter(u => u.role === 'shipper').length,
    total_carriers: users.filter(u => u.role === 'carrier').length,
    pending_trips: trips.filter(t => t.status === 'pending_payment').length,
    pending_shipments: shipments.filter(s => s.status === 'pending_payment').length,
    published_trips: trips.filter(t => t.is_published).length,
    published_shipments: shipments.filter(s => s.is_published).length,
  };

  return { data: stats };
}
