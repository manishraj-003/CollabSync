/**
 * WebSocket connection factory
 * All handlers must be attached in React components
 */
export function createWSConnection(token) {
  if (!token) return null;

  const socket = new WebSocket(
    `${import.meta.env.VITE_WS_URL}?token=${token}`
  );

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  return socket;
}
