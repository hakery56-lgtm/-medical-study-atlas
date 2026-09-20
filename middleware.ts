import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Initialize standard client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get session from cookies manually
  const sessionCookie = req.cookies.get('sb-access-token')?.value || 
                       req.cookies.get('sb-auth-token')?.value;

  // Protect all routes except login, signup, and redeem
  const isAuthPage = req.nextUrl.pathname === '/login' || 
                     req.nextUrl.pathname === '/signup' || 
                     req.nextUrl.pathname === '/redeem';
  
  const isPublicPage = req.nextUrl.pathname === '/'; 

  if (!isAuthPage && !isPublicPage) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Validate the session and check access expiry
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie);

    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('access_until')
      .eq('id', user.id)
      .single();

    if (!profile || new Date(profile.access_until) < new Date()) {
      return NextResponse.redirect(new URL('/redeem', req.url));
    }
  }

  return res;
}
