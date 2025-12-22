import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getSupabaseClient } from '@/lib/supabaseClient';


export const dynamic = 'force-dynamic';
export async function POST() {
  try {
    // Check authentication
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_URL || 'https://www.getxaxo.com';

    // Type the params explicitly
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription' as const,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'XAXO Enterprise AI Agent Platform',
              description: 'Automate customer support, sales, and operations',
            },
            unit_amount: 10000, // $100.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],

      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      metadata: {
        user_id: session.user.id,
        user_email: session.user.email || '',
      },
    };

    const checkoutSession = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}