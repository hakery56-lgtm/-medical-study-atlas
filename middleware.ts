import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protect all routes except login, signup, and redeem
  const isAuthPage = req.nextUrl.pathname === '/login' || 
                     req.nextUrl.pathname === '/signup' || 
                     req.nextUrl.pathname === '/redeem';
  
  const isPublicPage = req.nextUrl.pathname === '/'; // Home page is public

  if (!isAuthPage && !isPublicPage) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('access_until')
      .eq('id', session.user.id)
      .single();

    if (!profile || new Date(profile.access_until) < new Date()) {
      return NextResponse.redirect(new URL('/redeem', req.url));
    }
  }

  return res;
}
