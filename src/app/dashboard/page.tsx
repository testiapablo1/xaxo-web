'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session.user);
    
    // Fetch license key from database
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">XAXO Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow px-6 py-8">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Your subscription: <strong>$100/month</strong>
                  </p>
                </div>
              </div>
            </div>

            {licenseKey ? (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your License Key</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <code className="text-sm font-mono text-gray-800">{licenseKey}</code>
                </div>
                <p className="mt-2 text-sm text-gray-600">Use this key to validate API requests</p>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-gray-600">No active license key. Please complete your subscription via Stripe.</p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Integration</h3>
              <p className="text-sm text-gray-600 mb-2">Validate your license with POST request:</p>
              <div className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
{`POST /api/license/validate
Content-Type: application/json

{
  "licenseKey": "your-license-key"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}