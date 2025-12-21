'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
    const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

        // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }



    const { error } = await supabase.auth.signUp({
      email,
      password,
            options: {
        data: {
          full_name: fullName,
          company_name: company,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
                        {/* Profile fields */}
              <div>
                <label htmlFor="fullName" className="sr-only">Full name</label>
                <input
                        setMessage('Check your email for confirmation link!');
      router.push('/login');
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="company" className="sr-only">Company name</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              </div>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

                          <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
          </div>
          {message && <p className="text-sm text-center text-blue-600">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <div className="text-center">
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Already have an account? Log in</a>
        </div>
      </div>
    </div>
  );
}
