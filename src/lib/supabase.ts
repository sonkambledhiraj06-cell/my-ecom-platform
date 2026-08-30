import { createClient } from '@supabase/supabase-js';

const getValidUrl = (url?: string) => {
	if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
		return url;
	}
	return 'https://placeholder-project.supabase.co';
};

const supabaseUrl = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);