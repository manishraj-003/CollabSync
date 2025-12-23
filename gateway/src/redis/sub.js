const Redis = require("ioredis");
const apply = require("../ot/apply");
const roomManager = require("../roomManager");

const sub = new Redis(process.env.REDIS_URL);

sub.on("message", (channel, message) => {
  const parts = channel.split(":");
  const docId = parts[1];

  const op = JSON.parse(message);
  const room = roomManager.getRoom(docId);
  if (!room) return;

  // Apply op
  room.text = apply(room.text, op);

  // Broadcast to local clients
  roomManager.broadcast(docId, {
    type: "op",
    op
  });
});

module.exports = sub;
