const roomManager = require("../roomManager");
const RedisPub = require("../redis/pub");

module.exports = function handleClientEvent(wss, ws, msg) {
  const { type } = msg;

  switch (type) {
    case "join":
      return joinDocument(ws, msg);

    case "cursor":
      return updateCursor(ws, msg);

    case "chat":
      return sendChat(ws, msg); // 🔥 FIXED

    case "presence":
      return updatePresence(ws, msg);

    default:
      console.log("Unknown event", msg);
  }
};

/* ======================
   JOIN DOCUMENT
====================== */
function joinDocument(ws, msg) {
  const { docId } = msg;

  roomManager.joinRoom(docId, ws);

  // Notify others
  roomManager.broadcast(docId, {
    type: "presence",
    userId: ws.user.id,
    name: ws.user.name,
    status: "online"
  });

  // Send back existing users
  const room = roomManager.getRoom(docId);

  ws.send(
    JSON.stringify({
      type: "init",
      users: Object.keys(room.presence),
      cursors: room.cursors
    })
  );
}

/* ======================
   CURSOR (REDIS OK)
====================== */
function updateCursor(ws, msg) {
  const { docId, position } = msg;

  const room = roomManager.getRoom(docId);
  if (!room) return;

  room.cursors[ws.user.id] = position;

  roomManager.broadcast(docId, {
    type: "cursor",
    userId: ws.user.id,
    position
  });

  // Redis for scaling
  RedisPub.publish(
    `cursor:${docId}`,
    JSON.stringify({
      type: "cursor",
      userId: ws.user.id,
      position
    })
  );
}

/* ======================
   CHAT (NO REDIS)
====================== */
function sendChat(ws, msg) {
  const { docId, text } = msg;
  if (!docId || !text) return;

  RedisPub.publish(
    `chat:${docId}`,
    JSON.stringify({
      type: "chat",
      text,
      name: ws.user.name,
      gatewayId: process.env.GATEWAY_ID
    })
  );
}


/* ======================
   PRESENCE (REDIS OK)
====================== */
function updatePresence(ws, msg) {
  const { docId, status } = msg;

  roomManager.broadcast(docId, {
    type: "presence",
    userId: ws.user.id,
    status
  });

  RedisPub.publish(
    `presence:${docId}`,
    JSON.stringify({
      type: "presence",
      userId: ws.user.id,
      status
    })
  );
}
