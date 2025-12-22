"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login?next=/subscribe");
        return;
      }

      try {
        const res = await fetch("/api/stripe/checkout", { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Checkout failed");
        if (!json?.url) throw new Error("Missing checkout url");
        window.location.href = json.url;
      } catch (e: any) {
        setError(e?.message || "Checkout failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Redirecting to checkout…</h1>
      <p className="mt-2 text-sm text-gray-600">
        {loading ? "Please wait." : "If you are not redirected, try again."}
      </p>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </main>
  );
}
