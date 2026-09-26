import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    
    // Use a client with the Service Role Key to allow admin updates (bypassing RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // Get the user token from headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!code) return NextResponse.json({ error: 'Access code is required' }, { status: 400 });

    // 1. Claim the code in one step: the update only matches while it is unused,
    //    so two simultaneous requests can't both redeem the same code
    const { data: claimed, error: claimError } = await supabase
      .from('access_codes')
      .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
      .eq('code', code)
      .eq('is_used', false)
      .select('code');

    if (claimError) throw claimError;
    if (!claimed?.length) {
      return NextResponse.json({ error: 'Invalid or already used code' }, { status: 400 });
    }

    // 2. Extend access by 30 days, counting from the current expiry if access is still active
    const { data: profile } = await supabase
      .from('profiles')
      .select('access_until')
      .eq('id', user.id)
      .single();

    const current = profile?.access_until ? new Date(profile.access_until) : null;
    const expiryDate = current && current > new Date() ? current : new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ access_until: expiryDate.toISOString() })
      .eq('id', user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ 
      success: true, 
      expiresAt: expiryDate.toISOString(),
      message: 'Access granted for 30 days!' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
