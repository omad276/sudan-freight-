'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Profile, UserRole } from '@/types';

export async function getProfile(userId?: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const targetId = userId || user.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetId)
    .single();

  if (error) {
    return { error: error.message };
  }

  // Get user rating
  const { data: ratingData } = await supabase
    .rpc('get_user_rating', { user_uuid: targetId });

  return {
    data: {
      ...data,
      avg_rating: ratingData?.[0]?.avg_rating || 0,
      rating_count: ratingData?.[0]?.rating_count || 0,
    },
  };
}

export async function updateProfile(data: Partial<Profile>) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      ...(data.name && { name: data.name }),
      ...(data.company_name !== undefined && { company_name: data.company_name }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.preferred_language && { preferred_language: data.preferred_language }),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/shipper/profile');
  revalidatePath('/carrier/profile');

  return { data: profile };
}

export async function getUsers(filters?: { role?: UserRole; verified?: boolean; active?: boolean }) {
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

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }
  if (filters?.verified !== undefined) {
    query = query.eq('is_verified', filters.verified);
  }
  if (filters?.active !== undefined) {
    query = query.eq('is_active', filters.active);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function verifyUser(userId: string, verified: boolean = true) {
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
    return { error: 'Only admins can verify users' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: verified })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/users');

  return { data };
}

export async function toggleUserActive(userId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  // Only admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    return { error: 'Only admins can suspend/activate users' };
  }

  // Get current status
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('is_active')
    .eq('id', userId)
    .single();

  if (!targetProfile) {
    return { error: 'User not found' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: !targetProfile.is_active })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/users');

  return { data };
}

export async function getUnverifiedUsers() {
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
    .from('profiles')
    .select('*')
    .eq('is_verified', false)
    .neq('role', 'admin')
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
