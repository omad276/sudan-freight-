'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveContent(type: 'shipment' | 'trip', id: string) {
  const supabase = await createClient();
  const table = type === 'shipment' ? 'shipments' : 'trips';

  const { error } = await supabase
    .from(table)
    .update({
      status: 'published',
      is_published: true,
      admin_approved: true,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/approvals');
  revalidatePath('/admin/pending');
  return { success: true };
}

export async function rejectContent(type: 'shipment' | 'trip', id: string, reason: string) {
  const supabase = await createClient();
  const table = type === 'shipment' ? 'shipments' : 'trips';

  const { error } = await supabase
    .from(table)
    .update({
      status: 'cancelled',
      is_published: false,
      admin_approved: false,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/approvals');
  revalidatePath('/admin/pending');
  return { success: true };
}
