import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function getBaseUrl(req: Request) {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Missing auth token" }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes.user) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const userId = userRes.user.id;
    const email = userRes.user.email ?? undefined;
    const baseUrl = getBaseUrl(req);
    const priceId = process.env.STRIPE_PRICE_ID as string;
    if (!priceId) return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      customer_email: email,
      metadata: { user_id: userId },
      subscription_data: { metadata: { user_id: userId } },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Checkout error" }, { status: 500 });
  }
}