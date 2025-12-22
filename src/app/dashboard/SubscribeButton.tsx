"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/supabase-js";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login?next=/dashboard";
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Checkout failed");
      if (!json?.url) throw new Error("Missing checkout url");
      window.location.href = json.url;
    } catch (e: any) {
      setError(e?.message || "Checkout failed");
      setLoading(false);
    }
  }
  return (
    <div className="mt-6">
      <button
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        onClick={startCheckout}
        disabled={loading}
      >
        {loading ? "Redirecting to Stripe..." : "Subscribe now ($100/mo)"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
