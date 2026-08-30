import { createBrowserClient } from '@supabase/ssr'

const FALLBACK_URL = 'https://placeholder-project.supabase.co';
const FALLBACK_KEY = 'placeholder-key';

const getValidUrl = (url?: string) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  return FALLBACK_URL;
};

export function createClient() {
  const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_KEY;

  return createBrowserClient(supabaseUrl, supabaseKey)
}
