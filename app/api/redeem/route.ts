import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the code exists and is not used
    const { data: codeData, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (codeError || !codeData || codeData.is_used) {
      return NextResponse.json({ error: 'Invalid or already used code' }, { status: 400 });
    }

    // 1. Mark code as used
    const { error: updateCodeError } = await supabase
      .from('access_codes')
      .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
      .eq('code', code);

    if (updateCodeError) throw updateCodeError;

    // 2. Extend access by 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ access_until: expiryDate.toISOString() })
      .eq('id', user.id);

    if (updateProfileError) throw updateProfileError;

    return NextResponse.json({ 
      success: true, 
      expiresAt: expiryDate.toISOString(),
      message: 'Access granted for 30 days!' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
