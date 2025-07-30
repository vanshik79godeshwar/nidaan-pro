'use client';
import { useVideo } from '@100mslive/react-sdk';
import { HMSPeer } from '@100mslive/react-sdk';

export default function VideoTile({ peer, isLocal }: { peer: HMSPeer, isLocal: boolean }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  return (
    <div className="relative w-full h-full bg-gray-700 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal} // Mute your own video to prevent echo
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {peer.name} {isLocal ? '(You)' : ''}
      </div>
    </div>
  );
}