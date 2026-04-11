// Only export browser client from barrel file
// Server client should be imported directly from '@/lib/supabase/server'
export { createClient as createBrowserClient } from './client';
