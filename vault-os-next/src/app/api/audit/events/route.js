import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    events: [
      { id: 'evt_bootstrap', type: 'system.bootstrap', severity: 'info' }
    ]
  });
}
