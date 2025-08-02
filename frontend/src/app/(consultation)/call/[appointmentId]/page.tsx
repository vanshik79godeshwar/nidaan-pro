'use client';

import { useState } from 'react'; // Import useState
import { HMSRoomProvider, useHMSStore, selectIsConnectedToRoom } from '@100mslive/react-sdk';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Room from '@/components/video/Room';
import JoinForm from '@/components/video/JoinForm';
import { useParams } from 'next/navigation';
import LeavingScreen from '@/components/video/LeavingScreen'; // Import the new component

function CallPage() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const params = useParams();
  const appointmentId = params.appointmentId as string;
  const [isLeaving, setIsLeaving] = useState(false); // State to manage the leaving transition

  const handleLeave = () => {
      setIsLeaving(true);
  };

  const renderContent = () => {
    if (isLeaving) {
      return <LeavingScreen />;
    }
    if (isConnected) {
      return <Room appointmentId={appointmentId} onLeave={handleLeave} />;
    }
    return <JoinForm />;
  };

  return (
    <main className="w-full h-screen bg-gray-900 text-white flex items-center justify-center">
      {renderContent()}
    </main>
  );
}

export default function ProtectedCallPageWrapper() {
    return (
        <ProtectedRoute>
            <HMSRoomProvider>
                <CallPage />
            </HMSRoomProvider>
        </ProtectedRoute>
    )
}