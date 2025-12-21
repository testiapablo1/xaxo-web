import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ valid: false, message: 'License validation not implemented' }, { status: 200 });
}
