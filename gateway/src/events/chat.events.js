const roomManager = require("../roomManager");

module.exports = function handleChat(ws, msg) {
  const { docId, text } = msg;

  if (!docId || !text) return;

  // 🔥 Single source of truth: server broadcast
  roomManager.broadcast(docId, {
    type: "chat",
    text
  });
};
