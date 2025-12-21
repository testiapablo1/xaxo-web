'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navimport { supabase } from '@/lib/supabaseClient';igation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentCnc () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    if (!session.user.email_confirmed_at) {
      setNeedsConfirmation(true);
      setLoading(false);
      return;
    }

    setUser(session.user);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    const { data } = await supabase
      .from('licenses')
      .select('license_key')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setLicenseKey(data.license_key);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || ''
      });
      if (error) {
        alert(error.message);
      } else {
        alert('Confirmation email resent!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to resend email');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (needsConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h2 className="text-3xl font-bold">Email confirmation required</h2>
          <p className="text-gray-600">Please confirm your email to access the dashboard.</p>
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {loading ? 'Sending...' : 'Resend confirmation email'}
          </button>
          <button
            onClick={handleLogout}
            className="block w-full mt-4 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            {profile ? (
              <div className="space-y-2">
                <p><span className="font-medium">Full Name:</span> {profile.full_name}</p>
                <p><span className="font-medium">Company:</span> {profile.company_name}</p>
                <p><span className="font-medium">Role:</span> {profile.role}</p>
                <p><span className="font-medium">Email:</span> {user?.email}</p>
              </div>
            ) : (
              <p className="text-gray-500">No profile data found</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">License</h2>
            {licenseKey ? (
              <div>
                <p className="font-medium">License Key:</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-2">{licenseKey}</p>
              </div>
            ) : (
              <p className="text-gray-500">No active license</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}