import { useEffect, useState } from 'react';
import { WS_URL } from '../lib/config';

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // const user = useUser();

  useEffect(() => {
    // No server configured (a static deployment, say) — never attempt a connection.
    if (!WS_URL) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  return socket;
};