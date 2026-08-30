import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FALLBACK_URL = 'https://placeholder-project.supabase.co';
const FALLBACK_KEY = 'placeholder-key';

const getValidUrl = (url?: string) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  return FALLBACK_URL;
};

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_KEY;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          console.error("Unable to set Supabase auth cookie:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          console.error("Unable to remove Supabase auth cookie:", error)
        }
      },
    },
  })
}
