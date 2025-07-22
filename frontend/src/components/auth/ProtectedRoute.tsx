'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We need to check for the token because the user state might not be updated on first load
    const storedToken = localStorage.getItem('authToken');
    if (!token && !storedToken) {
      router.push('/login');
    }
  }, [user, token, router]);

  // Render a loading state or nothing while redirecting
  if (!token) {
    return null;
  }

  return <>{children}</>;
}