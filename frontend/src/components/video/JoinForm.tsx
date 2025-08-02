'use client';

import { useHMSActions } from '@100mslive/react-sdk';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Button from '../ui/Button';
import { Loader } from 'lucide-react'; // Import a loader icon

export default function JoinForm() {
  const hmsActions = useHMSActions();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const joinRoom = async () => {
    if (!user || !token) return;
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.get('/consultations/video/code', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const roomCode = data.code;

      if (!roomCode) throw new Error('Failed to get room code from server');
      
      const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode });
      
      await hmsActions.join({ userName: user.fullName, authToken }); // Use full name for better display

    } catch (e: any) {
      setError(e.message || 'Failed to join the room.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      joinRoom();
    }
  }, [user, token]);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">Nidaan Pro</h1>
        <h2 className="text-xl font-semibold mb-6 text-white">Secure Video Consultation</h2>
        {isLoading && (
            <div className="flex flex-col items-center text-gray-300">
                <Loader className="animate-spin h-12 w-12 mb-4" />
                <p>Connecting to your secure room...</p>
            </div>
        )}
        {error && (
            <div>
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={joinRoom} disabled={isLoading}>
                    Retry Connection
                </Button>
            </div>
        )}
    </div>
  );
}