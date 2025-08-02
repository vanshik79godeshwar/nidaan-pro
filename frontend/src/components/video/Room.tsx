'use client';

import { useHMSStore, selectLocalPeer, selectPeers } from '@100mslive/react-sdk';
import VideoTile from './VideoTile';
import Controls from './Controls';
import { Clock } from 'lucide-react';

export default function Room({ appointmentId, onLeave }: { appointmentId: string, onLeave: () => void }) {
  const localPeer = useHMSStore(selectLocalPeer);
  const peers = useHMSStore(selectPeers);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">Nidaan Pro</h1>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock size={18} />
          <span>Consultation in Progress</span>
        </div>
      </header>

      {/* Main Video Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 place-items-center overflow-y-auto">
        {localPeer && <VideoTile peer={localPeer} isLocal={true} />}
        {peers
          .filter((peer) => !peer.isLocal)
          .map((peer) => (
            <VideoTile key={peer.id} peer={peer} isLocal={false} />
          ))}
      </main>

      {/* Footer Controls */}
      <footer className="py-4 bg-gray-800 border-t border-gray-700">
        <Controls appointmentId={appointmentId} onLeave={onLeave}/>
      </footer>
    </div>
  );
}