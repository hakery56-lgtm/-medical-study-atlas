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

    const { data: codeData, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (codeError || !codeData || codeData.is_used) {
      return NextResponse.json({ error: 'Invalid or already used code' }, { status: 400 });
    }

    // 1. Mark code as used
    await supabase
      .from('access_codes')
      .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
      .eq('code', code);

    // 2. Extend access by 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await supabase
      .from('profiles')
      .update({ access_until: expiryDate.toISOString() })
      .eq('id', user.id);

    return NextResponse.json({ 
      success: true, 
      expiresAt: expiryDate.toISOString(),
      message: 'Access granted for 30 days!' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
