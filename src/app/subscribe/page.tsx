'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      // if (!data.session) router.push('/login');
    });
  }, [router]);

  async function onSubscribe() {
    setLoading(true);
    setError(null);
    try {
//       const { data: sess } = await supabase.auth.getSession();
      // const token = sess.session?.access_token;
      // if (!token) {
        // router.push('/login');
        // return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
//        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create checkout session');
      window.location.href = json.url;
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Subscribe</h1>
      <p className="mt-3 text-slate-600">
        Subscribe to XAXO for <span className="font-medium">$100/month</span>. Your license key will appear in your dashboard after payment.
      </p>
      <button
        onClick={onSubscribe}
        disabled={loading}
        className="mt-8 w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {loading ? 'Redirecting…' : 'Subscribe $100/mo'}
      </button>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </main>
  );
}