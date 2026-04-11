'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TripFormData, TripFilters } from '@/types';

// Create a new trip (Carrier)
export async function createTrip(data: TripFormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  // Verify user is a carrier
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'carrier') {
    return { error: 'Only carriers can create trips' };
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      carrier_id: user.id,
      from_city: data.from_city,
      to_city: data.to_city,
      trip_date: data.trip_date,
      truck_type: data.truck_type || null,
      capacity_tons: data.capacity_tons || null,
      price_sdg: data.price_sdg || null,
      notes: data.notes || null,
      is_published: false,
      status: 'pending_payment',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/carrier/trips');
  revalidatePath('/carrier/dashboard');
  revalidatePath('/admin/pending');

  return { data: trip };
}

// Get carrier's own trips
export async function getMyTrips() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized', data: [] };
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('carrier_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

// Get all published trips (public browse)
export async function getPublishedTrips(filters?: TripFilters) {
  const supabase = await createClient();

  let query = supabase
    .from('trips')
    .select(`
      *,
      carrier:profiles!carrier_id(id, name, company_name, city)
    `)
    .eq('is_published', true)
    .eq('status', 'published')
    .order('trip_date', { ascending: true });

  // Apply filters
  if (filters?.from_city) {
    query = query.eq('from_city', filters.from_city);
  }
  if (filters?.to_city) {
    query = query.eq('to_city', filters.to_city);
  }
  if (filters?.truck_type) {
    query = query.eq('truck_type', filters.truck_type);
  }
  if (filters?.date_from) {
    query = query.gte('trip_date', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('trip_date', filters.date_to);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

// Get single trip
export async function getTrip(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      carrier:profiles!carrier_id(id, name, email, company_name, city)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

// Delete own trip (only if not published)
export async function deleteTrip(id: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)
    .eq('carrier_id', user.id)
    .eq('is_published', false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/carrier/trips');

  return { success: true };
}

// Admin: Get unpublished/pending trips
export async function getPendingTrips() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized', data: [] };
  }

  // Only admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized', data: [] };
  }

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      carrier:profiles!carrier_id(id, name, email, company_name)
    `)
    .eq('is_published', false)
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

// Admin: Publish trip with fee
export async function publishTrip(id: string, feeAmount?: number, feeNote?: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  // Only admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Only admins can publish trips' };
  }

  const { data, error } = await supabase
    .from('trips')
    .update({
      is_published: true,
      status: 'published',
      fee_amount: feeAmount || null,
      fee_note: feeNote || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/pending');
  revalidatePath('/browse');
  revalidatePath('/carrier/trips');

  return { data };
}

// Admin: Get all trips
export async function getAllTrips() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized', data: [] };
  }

  // Only admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized', data: [] };
  }

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      carrier:profiles!carrier_id(id, name, email, company_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
