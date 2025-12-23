const roomManager = require("../roomManager");
const apply = require("../ot/apply");

module.exports = function (_, channel, message) {
  const [type, docId] = channel.split(":");
  const payload = JSON.parse(message);

  const room = roomManager.getRoom(docId);
  if (!room) return; // no connected users here

  if (type === "editor") {
    room.text = apply(room.text, payload.op);
  }

  roomManager.broadcast(docId, payload);
};
