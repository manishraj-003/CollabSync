const apply = require("../ot/apply");
const transform = require("../ot/transform");
const roomManager = require("../roomManager");
const RedisPub = require("../redis/pub");

module.exports = {
  async handleOperation(ws, msg) {
    const { docId, op } = msg;

    const room = roomManager.getRoom(docId);
    if (!room) return;

    // Get existing operations in queue (if any)
    const pendingOps = room.pending || [];
    
    // Transform op against pending ops
    for (const p of pendingOps) {
      op = transform(p, op);
    }

    // Apply operation to document state in memory
    room.text = apply(room.text, op);

    // Add to pending ops
    pendingOps.push(op);
    room.pending = pendingOps;

    // Broadcast to other users
    roomManager.broadcast(docId, {
      type: "op",
      op
    });

    // Publish to Redis for horizontal scaling
    RedisPub.publish(`editor:${docId}`, JSON.stringify({
        type: "op",
        op
    }));
  }
};
