import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { licenseKey } = await request.json();

    if (!licenseKey) {
      return NextResponse.json(
        { valid: false, error: 'License key is required' },
        { status: 400 }
      );
    }

    // Query license from database
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or inactive license key' },
        { status: 404 }
      );
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'License key has expired' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      license: {
        key: data.license_key,
        status: data.status,
        expiresAt: data.expires_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}