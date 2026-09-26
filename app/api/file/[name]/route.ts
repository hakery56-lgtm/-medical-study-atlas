import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { subjects } from '@/data/subjects';

// middleware.ts has already checked login + active access before this runs.
// Only files the library links to can be signed, never arbitrary bucket paths.
const allowed = new Set(
  subjects.flatMap((s) => s.resources).flatMap((r) => (r.file_url ? [decodeURIComponent(r.file_url.split('/').pop()!)] : []))
);

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!allowed.has(name)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase.storage.from('resources').createSignedUrl(name, 300);
  if (error || !data) {
    console.error(error);
    return NextResponse.json({ error: 'File unavailable' }, { status: 502 });
  }
  return NextResponse.redirect(data.signedUrl);
}
