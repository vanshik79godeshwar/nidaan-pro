'use client';

import { useEffect } from 'react';
import {
  HMSRoomProvider, // <-- Import the provider
  useHMSStore,
  selectIsConnectedToRoom,
} from '@100mslive/react-sdk';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Room from '@/components/video/Room';
import JoinForm from '@/components/video/JoinForm';

function CallPage() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-gray-900 text-white flex items-center justify-center">
      {isConnected ? <Room /> : <JoinForm />}
    </div>
  );
}

// --- THIS IS THE FIX ---
// We wrap the entire page component in the HMSRoomProvider.
// This makes all the 100ms hooks available to the CallPage and its children.
export default function ProtectedCallPageWrapper() {
    return (
        <ProtectedRoute>
            <HMSRoomProvider>
                <CallPage />
            </HMSRoomProvider>
        </ProtectedRoute>
    )
}