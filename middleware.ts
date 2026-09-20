import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Protect all routes except login, signup, and redeem
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === '/login' || 
                     pathname === '/signup' || 
                     pathname === '/redeem';
  
  const isPublicPage = pathname === '/'; 

  if (!isAuthPage && !isPublicPage) {
    // Get session from cookies manually
    const sessionCookie = req.cookies.get('sb-access-token')?.value || 
                           req.cookies.get('sb-auth-token')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Initialize client inside the guard to avoid unnecessary instantiation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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

    if (!profile || !profile.access_until || new Date(profile.access_until) < new Date()) {
      return NextResponse.redirect(new URL('/redeem', req.url));
    }
  }

  return NextResponse.next();
}
