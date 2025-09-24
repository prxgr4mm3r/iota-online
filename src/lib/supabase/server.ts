import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';


export function supabaseServer() {
return createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{ cookies: { get(name: string){ return cookies().get(name)?.value } } as any }
);
}