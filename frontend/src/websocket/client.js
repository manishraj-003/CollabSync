let ws = null;

/**
 * Connect to WebSocket server
 */
export function connectSocket(token) {
  ws = new WebSocket(
    `${import.meta.env.VITE_WS_URL}?token=${token}`
  );

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
  };

  ws.onerror = (err) => {
    console.error("WebSocket error", err);
  };

  return ws;
}

/**
 * JOIN DOCUMENT
 */
export function joinDocument(docId) {
  if (!ws) return;

  ws.send(JSON.stringify({
    type: "join",
    docId
  }));
}

/**
 * CURSOR UPDATE
 */
export function sendCursor(docId, pos) {
  if (!ws) return;

  ws.send(JSON.stringify({
    type: "cursor",
    docId,
    position: { index: pos }
  }));
}

/**
 * CHAT MESSAGE
 */
export function sendChat(docId, text) {
  if (!ws) return;

  ws.send(JSON.stringify({
    type: "chat",
    docId,
    text
  }));
}

/**
 * PRESENCE UPDATE
 */
export function sendPresence(docId, status) {
  if (!ws) return;

  ws.send(JSON.stringify({
    type: "presence",
    docId,
    status
  }));
}

export function sendOperation(docId, op) {
  if (!ws) return;

  ws.send(JSON.stringify({
    type: "op",
    docId,
    op
  }));
}

export function createWSConnection(token) {
  const ws = new WebSocket(
    `${import.meta.env.VITE_WS_URL}?token=${token}`
  );

  ws.onopen = () => console.log("Connected to WS server");
  ws.onerror = (err) => console.log("WS Error:", err);

  return ws;
}

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case "op":
      applyOperationToEditor(msg.op);
      break;

    case "cursor":
      updateRemoteCursor(msg.userId, msg.position);
      break;

    case "presence":
      updatePresenceUI(msg);
      break;

    case "chat":
      appendChatMessage(msg);
      break;

    default:
      console.log("Unknown message", msg);
  }
};
