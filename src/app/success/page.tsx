export default function Success() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Payment successful</h1>
      <p className="mt-3 text-slate-600">Your subscription is active. Go to your dashboard to see your license key.</p>
      <a className="mt-8 inline-block rounded-xl bg-black px-4 py-3 text-white" href="/dashboard">
        Go to dashboard
      </a>
    </main>
  );
}