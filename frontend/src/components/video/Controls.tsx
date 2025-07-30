'use client';
import {
  useHMSActions,
  useHMSStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
} from '@100mslive/react-sdk';
import Button from '../ui/Button';

export default function Controls() {
  const hmsActions = useHMSActions();
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);

  const toggleAudio = () => {
    hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  };

  const toggleVideo = () => {
    hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
  };

  const leaveRoom = () => {
    hmsActions.leave();
    // Redirect to dashboard after leaving
    window.location.href = '/dashboard';
  };

  return (
    <div className="bg-gray-800 p-4 flex justify-center items-center space-x-4">
      <Button onClick={toggleAudio}>
        {isLocalAudioEnabled ? 'Mute Mic' : 'Unmute Mic'}
      </Button>
      <Button onClick={toggleVideo}>
        {isLocalVideoEnabled ? 'Stop Video' : 'Start Video'}
      </Button>
      <Button onClick={leaveRoom} className="bg-red-600 hover:bg-red-700">
        Leave Call
      </Button>
    </div>
  );
}