import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export function useQueueSocket(doctorId) {
  const [queueUpdates, setQueueUpdates] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('[Socket] Connected to backend');
      setIsConnected(true);
      socket.emit('queue:join', doctorId);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
    });

    socket.on('queue:update', (data) => {
      console.log('[Socket] Received update:', data);
      setQueueUpdates(data);
    });

    return () => {
      socket.emit('queue:leave', doctorId);
      socket.disconnect();
    };
  }, [doctorId]);

  return { queueUpdates, isConnected };
}
