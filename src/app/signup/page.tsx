"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValid = useMemo(() => {
    if (!fullName.trim()) return false;
    if (!email.trim() || !email.includes("@")) return false;
    if (!password || password.length < 8) return false;
    if (!confirmPassword || confirmPassword !== password) return false;
    return true;
  }, [fullName, email, password, confirmPassword]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValid) return;
    setLoading(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xaxo-web.vercel.app";
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
          },
          emailRedirectTo: `${appUrl}/dashboard`,
        },
      });
      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm">
          We sent you a confirmation link. Please confirm your email to access the dashboard.
        </p>
        <button className="mt-6 rounded-md bg-black px-4 py-2 text-white" onClick={() => router.push("/login")}>
          Go to login
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Create your XAXO account</h1>
      <p className="mt-1 text-sm text-gray-600">Start your subscription and get your license key.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium">Full name *</label>
          <input className="mt-1 w-full rounded-md border p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium">Company name</label>
          <input className="mt-1 w-full rounded-md border p-2" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Email *</label>
          <input className="mt-1 w-full rounded-md border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium">Password *</label>
          <input className="mt-1 w-full rounded-md border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p className="mt-1 text-xs text-gray-500">Minimum 8 characters.</p>
        </div>

        <div>
          <label className="text-sm font-medium">Confirm password *</label>
          <input className="mt-1 w-full rounded-md border p-2" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={!isValid || loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </main>
  );
}
