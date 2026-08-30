import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://geguynfurlhuybvdgjra.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZ3V5bmZ1cmxodXlidmRnanJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NDUwNjQsImV4cCI6MjEwMzQyMTA2NH0.bRoXjsMAhPR4GfPX01KFgEl_wf_Kvk-ENjgHaDopTkA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
