'use client';

import {
  useHMSStore,
  selectLocalPeer,
  selectPeers,
} from '@100mslive/react-sdk';
import VideoTile from './VideoTile';
import Controls from './Controls';

export default function Room() {
  const localPeer = useHMSStore(selectLocalPeer);
  const peers = useHMSStore(selectPeers);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {localPeer && <VideoTile peer={localPeer} isLocal={true} />}
        {peers
          .filter((peer) => !peer.isLocal)
          .map((peer) => (
            <VideoTile key={peer.id} peer={peer} isLocal={false} />
          ))}
      </div>
      <Controls />
    </div>
  );
}