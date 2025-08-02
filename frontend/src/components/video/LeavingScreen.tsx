'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LeavingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard/appointments');
    }, 2500); // Wait 2.5 seconds before redirecting

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [router]);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-2xl text-center text-white">
        <LogOut className="h-12 w-12 mb-4 text-blue-400" />
        <h2 className="text-2xl font-semibold mb-2">Consultation Ended</h2>
        <p className="text-gray-300">You have left the meeting.</p>
        <p className="text-gray-400 mt-4">Redirecting you to the dashboard...</p>
    </div>
  );
}