'use client';

import { useHMSActions } from '@100mslive/react-sdk';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Button from '../ui/Button';

export default function JoinForm() {
  const hmsActions = useHMSActions();
  const { user, token } = useAuth(); // Get the user's auth token for our backend

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const joinRoom = async () => {
    if (!user || !token) return;
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Call our backend to get the temporary Room Code
      const { data } = await api.get('/consultations/video/code', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const roomCode = data.code;

      if (!roomCode) {
        throw new Error('Failed to get room code from server');
      }

      // Step 2: Use the 100ms SDK to exchange the Room Code for an auth token
      const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode });

      // Step 3: Join the room using the auth token
      await hmsActions.join({
        userName: user.id, // Use a unique identifier
        authToken,
      });

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
    <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Joining Consultation Room</h2>
      {isLoading && <p className="text-gray-400">Connecting, please wait...</p>}
      {error && (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={joinRoom} disabled={isLoading}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}