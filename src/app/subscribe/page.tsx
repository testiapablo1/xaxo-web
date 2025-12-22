import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Stripe from "stripe";

export const runtime = "nodejs";

export default async function SubscribePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) redirect("/login?next=/subscribe");

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.getxaxo.com";
  if (!stripeSecret || !priceId) redirect("/dashboard?error=stripe_env_missing");

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" as any });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel`,
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    metadata: { user_id: user.id, user_email: user.email ?? "" },
  });

  if (!session.url) redirect("/dashboard?error=stripe_session_missing_url");
  redirect(session.url);
}
