import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 프론트엔드용 (Anon Key 활용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
