import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Allow static files, API routes, and public pages
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname === '/' || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Identify Auth pages
  const isAuthPage = pathname === '/login' || 
                     pathname === '/signup' || 
                     pathname === '/redeem';

  if (isAuthPage) {
    return NextResponse.next();
  }

  // 3. Protect all other routes
  const sessionCookie = req.cookies.get('sb-access-token')?.value || 
                       req.cookies.get('sb-auth-token')?.value;

  // send the user back to the page they wanted after logging in
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', pathname + req.nextUrl.search);

  if (!sessionCookie) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    // act as the user, so row level security on `profiles` lets them read only their own row
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${sessionCookie}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionCookie);

    if (authError || !user) {
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('access_until')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.access_until || new Date(profile.access_until) < new Date()) {
      return NextResponse.redirect(new URL('/redeem', req.url));
    }
  } catch (e) {
    console.error('Middleware error:', e);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
