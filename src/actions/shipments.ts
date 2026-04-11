'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ShipmentFormData, ShipmentFilters } from '@/types';

// Create a new cargo request (Shipper)
export async function createShipment(data: ShipmentFormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  // Verify user is a shipper
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'shipper') {
    return { error: 'Only shippers can create cargo requests' };
  }

  const { data: shipment, error } = await supabase
    .from('shipments')
    .insert({
      shipper_id: user.id,
      pickup_city: data.pickup_city,
      pickup_address: data.pickup_address || null,
      dropoff_city: data.dropoff_city,
      dropoff_address: data.dropoff_address || null,
      cargo_type: data.cargo_type,
      weight_tons: data.weight_tons,
      description: data.description || null,
      pickup_date: data.pickup_date,
      is_published: false,
      status: 'pending_payment',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/shipper/shipments');
  revalidatePath('/shipper/dashboard');
  revalidatePath('/admin/pending');

  return { data: shipment };
}

// Get shipper's own cargo requests
export async function getMyShipments() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized', data: [] };
  }

  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('shipper_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

// Get all published cargo requests (public browse)
export async function getPublishedShipments(filters?: ShipmentFilters) {
  const supabase = await createClient();

  let query = supabase
    .from('shipments')
    .select(`
      *,
      shipper:profiles!shipper_id(id, name, company_name, city)
    `)
    .eq('is_published', true)
    .eq('status', 'published')
    .order('pickup_date', { ascending: true });

  // Apply filters
  if (filters?.cargo_type) {
    query = query.eq('cargo_type', filters.cargo_type);
  }
  if (filters?.pickup_city) {
    query = query.eq('pickup_city', filters.pickup_city);
  }
  if (filters?.dropoff_city) {
    query = query.eq('dropoff_city', filters.dropoff_city);
  }
  if (filters?.min_weight) {
    query = query.gte('weight_tons', filters.min_weight);
  }
  if (filters?.max_weight) {
    query = query.lte('weight_tons', filters.max_weight);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

// Get single shipment
export async function getShipment(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      shipper:profiles!shipper_id(id, name, email, company_name, city)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

// Delete own shipment (only if not published)
export async function deleteShipment(id: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('shipments')
    .delete()
    .eq('id', id)
    .eq('shipper_id', user.id)
    .eq('is_published', false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/shipper/shipments');

  return { success: true };
}

// Admin: Get unpublished/pending shipments
export async function getPendingShipments() {
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
    .from('shipments')
    .select(`
      *,
      shipper:profiles!shipper_id(id, name, email, company_name)
    `)
    .eq('is_published', false)
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

// Admin: Publish shipment with fee
export async function publishShipment(id: string, feeAmount?: number, feeNote?: string) {
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
    return { error: 'Only admins can publish shipments' };
  }

  const { data, error } = await supabase
    .from('shipments')
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
  revalidatePath('/shipper/shipments');

  return { data };
}

// Admin: Get all shipments
export async function getAllShipments() {
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
    .from('shipments')
    .select(`
      *,
      shipper:profiles!shipper_id(id, name, email, company_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
