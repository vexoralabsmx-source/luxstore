import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://dhokfzncpbddcelgitcn.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRob2tmem5jcGJkZGNlbGdpdGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NDgxNjQsImV4cCI6MjEwMDQyNDE2NH0.dep8bhtfVlcw78sZkGMxiJkwrUj-yFZOPcTbEDCksp8';
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRob2tmem5jcGJkZGNlbGdpdGNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg0ODE2NCwiZXhwIjoyMTAwNDI0MTY0fQ.pm_w9vwwTlc1-UWJ8gkfUpIS30SBVOiHegTLVh1JtMc';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SERVICE_KEY;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
