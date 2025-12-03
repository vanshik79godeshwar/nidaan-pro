'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// 1. We move the logic into a separate component called "ResetPasswordForm"
function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams(); // This hook causes the build error if not suspended
  const router = useRouter();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('No reset token found. Please request a new link.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setMessage('');

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setMessage('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. The link may be invalid or expired.');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set a new password
        </h2>
      </div>

      {token ? (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="new-password"
            label="New Password"
            name="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Button type="submit">Reset Password</Button>
          </div>
        </form>
      ) : (
           <p className="text-center text-red-600">{error || 'Loading...'}</p>
      )}
    </div>
  );
}

// 2. The main default export now wraps the form in Suspense
export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}