import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://dhokfzncpbddcelgitcn.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRob2tmem5jcGJkZGNlbGdpdGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NDgxNjQsImV4cCI6MjEwMDQyNDE2NH0.dep8bhtfVlcw78sZkGMxiJkwrUj-yFZOPcTbEDCksp8';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  return createBrowserClient(supabaseUrl, anonKey);
}
