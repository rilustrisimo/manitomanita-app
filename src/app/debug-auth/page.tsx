'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DebugAuthPage() {
  const { user, session, loading } = useAuth();
  const [clientSession, setClientSession] = useState<any>(null);
  const [localStorage, setLocalStorage] = useState<any>({});
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    // Get client session
    const getClientSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      setClientSession(data.session);
    };

    // Get localStorage data
    const getLocalStorageData = () => {
      if (typeof window !== 'undefined') {
        const localData: any = {};
        Object.keys(window.localStorage).forEach(key => {
          if (key.includes('auth') || key.includes('supabase') || key.includes('manitomanita')) {
            localData[key] = window.localStorage.getItem(key);
          }
        });
        setLocalStorage(localData);
      }
    };

    // Get cookies
    const getCookies = () => {
      if (typeof window !== 'undefined') {
        setCookies(document.cookie);
      }
    };

    getClientSession();
    getLocalStorageData();
    getCookies();
  }, []);

  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      Object.keys(window.localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('supabase') || key.includes('manitomanita')) {
          window.localStorage.removeItem(key);
        }
      });
      
      // Clear cookies (client-side, limited)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Reload to see changes
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1b1b1b] mb-4">Auth Debug Panel</h1>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button onClick={clearAllData} variant="destructive">
              Clear All Auth Data
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Auth Context State */}
          <Card>
            <CardHeader>
              <CardTitle>Auth Context State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
                <p><strong>User:</strong> {user ? user.email : 'null'}</p>
                <p><strong>Session:</strong> {session ? 'exists' : 'null'}</p>
                {user && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Session */}
          <Card>
            <CardHeader>
              <CardTitle>Client Session (Supabase)</CardTitle>
            </CardHeader>
            <CardContent>
              {clientSession ? (
                <div className="space-y-2">
                  <p><strong>Access Token:</strong> {clientSession.access_token ? 'exists' : 'missing'}</p>
                  <p><strong>Refresh Token:</strong> {clientSession.refresh_token ? 'exists' : 'missing'}</p>
                  <p><strong>Expires At:</strong> {clientSession.expires_at ? new Date(clientSession.expires_at * 1000).toLocaleString() : 'unknown'}</p>
                  <p><strong>User:</strong> {clientSession.user?.email || 'no user'}</p>
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(clientSession, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p>No client session found</p>
              )}
            </CardContent>
          </Card>

          {/* Local Storage */}
          <Card>
            <CardHeader>
              <CardTitle>Local Storage (Auth-related)</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(localStorage).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(localStorage).map(([key, value]) => (
                    <div key={key} className="border-b pb-2">
                      <p><strong>{key}:</strong></p>
                      <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {String(value)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No auth-related localStorage data found</p>
              )}
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              {cookies ? (
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                  {cookies}
                </pre>
              ) : (
                <p>No cookies found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
