import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseClient } from '@/lib/supabaseClient';

export async function POST() {
      // Check authentication
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'XAXO Enterprise AI Agent Platform',
              description: 'Automate customer support, sales, and operations with intelligent AI agents',
            },
            unit_amount: 10000, // $100.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
            metadata: {
        user_id: session.user.id,
        user_email: session.user.email,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}