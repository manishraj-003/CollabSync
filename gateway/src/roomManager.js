const rooms = {};  
// rooms[docId] = { users: Set<ws>, cursors: {}, presence: {} }

module.exports = {
  joinRoom(docId, ws) {
    if (!rooms[docId]) {
      rooms[docId] = {
        users: new Set(),
        cursors: {},
        presence: {}
      };
    }

    rooms[docId].users.add(ws);
    rooms[docId].presence[ws.user.id] = "online";

    return rooms[docId];
  },

  leaveRoom(docId, ws) {
    const room = rooms[docId];
    if (!room) return;

    room.users.delete(ws);
    delete room.cursors[ws.user.id];
    delete room.presence[ws.user.id];

    if (room.users.size === 0) delete rooms[docId];
  },

  handleDisconnect(wss, ws) {
    for (const docId in rooms) {
      if (rooms[docId].users.has(ws)) {
        this.leaveRoom(docId, ws);
        this.broadcast(docId, {
          type: "presence",
          userId: ws.user.id,
          status: "offline"
        });
      }
    }
  },

  broadcast(docId, msg) {
    const room = rooms[docId];
    if (!room) return;

    for (const client of room.users) {
      if (client.readyState === 1) {
        client.send(JSON.stringify(msg));
      }
    }
  },

  getRoom(docId) {
    return rooms[docId];
  }
};
