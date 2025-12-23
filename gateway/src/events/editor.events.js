const apply = require("../ot/apply");
const transform = require("../ot/transform");
const roomManager = require("../roomManager");
const redisPub = require("../redis/pub");

async function handleOperation(ws, msg) {
  const { docId, op } = msg;

  const room = roomManager.getRoom(docId);
  if (!room) return;

  // 1️⃣ Transform against pending ops
  const pendingOps = room.pending || [];
  for (const prevOp of pendingOps) {
    op = transform(prevOp, op);
  }

  // 2️⃣ Apply operation locally
  room.text = apply(room.text, op);
  pendingOps.push(op);
  room.pending = pendingOps;

  // 3️⃣ Broadcast to users connected to THIS server
  roomManager.broadcast(docId, {
    type: "op",
    op
  });

  // 4️⃣ 🔴 PUBLISH TO REDIS (THIS IS YOUR CODE)
  redisPub.publish(
    `editor:${docId}`,
    JSON.stringify({
      type: "op",
      op
    })
  );
}

module.exports = { handleOperation };
