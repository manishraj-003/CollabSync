let socket = null;

/**
 * Create and return a WebSocket connection
 */
export function createWSConnection(token) {
  socket = new WebSocket(
    `${import.meta.env.VITE_WS_URL}?token=${token}`
  );

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };

  socket.onerror = (err) => {
    console.error("WebSocket error", err);
  };

  return socket;
}

/**
 * Send a message safely
 */
export function sendMessage(type, payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...payload }));
  }
}
