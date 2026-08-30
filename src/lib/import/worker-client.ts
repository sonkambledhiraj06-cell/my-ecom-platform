import { createClient } from "@supabase/supabase-js";

const FALLBACK_URL = 'https://placeholder-project.supabase.co';
const FALLBACK_KEY = 'placeholder-key';

export function createWorkerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(
    url && (url.startsWith('http://') || url.startsWith('https://')) ? url : FALLBACK_URL,
    key ?? FALLBACK_KEY,
  );
}
