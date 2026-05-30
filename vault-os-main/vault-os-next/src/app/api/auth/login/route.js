import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';

export async function POST(request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  return NextResponse.json({
    status: 'challenge_required',
    methods: ['totp', 'recovery_code']
  });
}
