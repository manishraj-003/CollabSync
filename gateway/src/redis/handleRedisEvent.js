const roomManager = require("../roomManager");
const apply = require("../ot/apply");

module.exports = function (_pattern, channel, message) {
  const [type, docId] = channel.split(":");
  const payload = JSON.parse(message);

  const room = roomManager.getRoom(docId);
  if (!room) return;

  if (type === "editor") {
    room.text = apply(room.text, payload.op);
  }

  roomManager.broadcast(docId, payload);
};

module.exports = function handleRedisEvent(pattern, channel, message) {
  const data = JSON.parse(message);

  // 🔥 IGNORE self-published messages
  if (data.origin === undefined) return;

  const docId = channel.split(":")[1];

  roomManager.broadcast(docId, data);
};
