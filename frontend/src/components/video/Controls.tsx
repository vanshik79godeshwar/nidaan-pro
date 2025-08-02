'use client';
import { useHMSActions, useHMSStore, selectIsLocalAudioEnabled, selectIsLocalVideoEnabled } from '@100mslive/react-sdk';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Controls({ appointmentId, onLeave }: { appointmentId: string, onLeave: () => void }) {
  const hmsActions = useHMSActions();
  const { token } = useAuth();
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);

  const toggleAudio = () => hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  const toggleVideo = () => hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);

  const leaveRoom = async () => {
    try {
      await api.post(`/consultations/${appointmentId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark appointment as completed:', error);
    } finally {
      hmsActions.leave();
      onLeave(); // Call the onLeave callback to handle post-leave actions
      // Optionally redirect or show a message
      window.location.href = '/dashboard/appointments';
    }
  };

  const ControlButton = ({ onClick, children, danger = false }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) => (
    <button
      onClick={onClick}
      className={`p-3 rounded-full transition-colors ${
        danger 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-gray-600 hover:bg-gray-500'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex justify-center items-center space-x-4">
      <ControlButton onClick={toggleAudio}>
        {isLocalAudioEnabled ? <Mic /> : <MicOff className="text-red-400"/>}
      </ControlButton>
      <ControlButton onClick={toggleVideo}>
        {isLocalVideoEnabled ? <Video /> : <VideoOff className="text-red-400"/>}
      </ControlButton>
      <ControlButton onClick={leaveRoom} danger>
        <PhoneOff />
      </ControlButton>
    </div>
  );
}