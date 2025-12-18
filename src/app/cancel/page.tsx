export default function Cancel() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Checkout canceled</h1>
      <p className="mt-3 text-slate-600">You can subscribe again whenever you're ready.</p>
      <a className="mt-8 inline-block rounded-xl bg-black px-4 py-3 text-white" href="/subscribe">
        Back to subscribe
      </a>
    </main>
  );
}