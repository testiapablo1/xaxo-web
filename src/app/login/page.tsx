'use client';

import { useState } from 'react';
import { useRouter } from 'next/navimport { supabase } from '@/lib/supabaseClient';igation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentC=> {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setNeedsConfirmation(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setNeedsConfirmation(true);
          setMessage('Please confirm your email before signing in.');
        } else {
          setMessage(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user && !data.user.email_confirmed_at) {
        setNeedsConfirmation(true);
        setMessage('Please confirm your email before signing in.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setMessage(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Confirmation email resent!');
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to resend email');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to your account</h2>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
          {message && (
            <div className={`text-sm text-center ${needsConfirmation ? 'text-orange-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}
          {needsConfirmation && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {loading ? 'Sending...' : 'Resend confirmation email'}
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="text-center">
          <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
}