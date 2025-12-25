const WebSocket = require("ws");
const verifyWsAuth = require("./middleware/wsAuth");
const roomManager = require("./roomManager");
const handleClientEvent = require("./events");

// Redis (KEEP for other events)
const RedisSub = require("./redis/sub");
const handleRedisEvent = require("./redis/handleRedisEvent");

// ❌ DO NOT SUBSCRIBE TO chat
RedisSub.psubscribe("editor:*");
RedisSub.psubscribe("cursor:*");
RedisSub.psubscribe("presence:*");
// RedisSub.psubscribe("chat:*"); ❌ REMOVE

RedisSub.on("pmessage", handleRedisEvent);

module.exports = (server) => {
  const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: verifyWsAuth
  });

  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.user = req.user;
      wss.emit("connection", ws);
    });
  });

  wss.on("connection", (ws) => {
    console.log("User connected:", ws.user.name);

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handleClientEvent(wss, ws, msg);
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    });

    ws.on("close", () => {
      roomManager.handleDisconnect(wss, ws);
    });
  });

  return wss;
};
