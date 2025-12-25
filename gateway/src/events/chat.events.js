const roomManager = require("../roomManager");

module.exports = function handleChat(ws, msg) {
  const { docId, text } = msg;
  if (!docId || !text) return;

  roomManager.broadcast(docId, {
    type: "chat",
    text,
    user: {
      name: ws.user?.name || "User"
    }
  });
};
