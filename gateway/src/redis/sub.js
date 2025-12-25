const Redis = require("ioredis");
const apply = require("../ot/apply");
const roomManager = require("../roomManager");

const sub = new Redis(process.env.REDIS_URL);

// Subscribe to patterns
sub.psubscribe("op:*", "chat:*", "cursor:*", "presence:*");

sub.on("pmessage", (pattern, channel, message) => {
  const [type, docId] = channel.split(":");
  const room = roomManager.getRoom(docId);
  if (!room) return;

  const data = JSON.parse(message);

  // 🔹 OT operations
  if (type === "op") {
    room.text = apply(room.text, data);
    roomManager.broadcast(docId, {
      type: "op",
      op: data
    });
  }

  // 🔹 Chat
  else if (type === "chat") {
    roomManager.broadcast(docId, data);
  }

  // 🔹 Cursor
  else if (type === "cursor") {
    roomManager.broadcast(docId, data);
  }

  // 🔹 Presence
  else if (type === "presence") {
    roomManager.broadcast(docId, data);
  }
});

module.exports = sub;
