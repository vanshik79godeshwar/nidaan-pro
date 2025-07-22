'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Nidaan Pro
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            // If user is logged in
            <>
              <Link href="/dashboard" className="px-4 py-2 text-gray-800 font-semibold hover:text-blue-500">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            // If user is logged out
            <>
              <Link href="/login" className="px-4 py-2 text-gray-800 hover:text-blue-500">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}