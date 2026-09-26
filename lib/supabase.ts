import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// supabase-js keeps the session in localStorage, but middleware.ts can only read cookies,
// so mirror the access token into the cookie it checks (on sign-in, refresh and sign-out).
// ponytail: token mirror, switch to @supabase/ssr cookie sessions if auth grows more complex
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((_event, session) => {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = session
      ? `sb-access-token=${session.access_token}; Path=/; Max-Age=${session.expires_in ?? 3600}; SameSite=Lax${secure}`
      : `sb-access-token=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  });
}
