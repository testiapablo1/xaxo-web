import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

function newLicenseKey() {
  const raw = crypto.randomBytes(24).toString("hex").toUpperCase();
  return `XAXO-${raw.slice(0, 6)}-${raw.slice(6, 12)}-${raw.slice(12, 18)}-${raw.slice(18, 24)}`;
}

async function upsertSubscriptionAndLicense(params: {
  userId: string;
  customerId?: string | null;
  subscriptionId: string;
  status: string;
  currentPeriodEnd?: number | null;
}) {
  const { userId, customerId, subscriptionId, status, currentPeriodEnd } = params;
  const periodIso = currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null;

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId ?? null,
      stripe_subscription_id: subscriptionId,
      status,
      current_period_end: periodIso,
    },
    { onConflict: "stripe_subscription_id" }
  );

  const active = status === "active" || status === "trialing";

  const { data: existing } = await supabaseAdmin
    .from("licenses")
    .select("id, license_key")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing?.license_key) {
    await supabaseAdmin.from("licenses").insert({
      user_id: userId,
      license_key: newLicenseKey(),
      status: active ? "active" : "inactive",
    });
  } else {
    await supabaseAdmin.from("licenses").update({ status: active ? "active" : "inactive" }).eq("user_id", userId);
  }
}

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const body = await req.text();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const userId = session?.metadata?.user_id;
      const subscriptionId = session?.subscription;
      const customerId = session?.customer;
      if (userId && subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertSubscriptionAndLicense({
          userId,
          customerId,
          subscriptionId,
          status: sub.status,
          currentPeriodEnd: (sub as any).current_period_end,
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as any;
      const userId = sub?.metadata?.user_id;
      if (userId && sub?.id) {
        await upsertSubscriptionAndLicense({
          userId,
          customerId: sub.customer,
          subscriptionId: sub.id,
          status: sub.status,
          currentPeriodEnd: (sub as any).current_period_end,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Webhook handler error" }, { status: 500 });
  }
}

export const runtime = "nodejs";