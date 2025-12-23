const WebSocket = require("ws");
const verifyWsAuth = require("./middleware/wsAuth");
const roomManager = require("./roomManager");
const handleClientEvent = require("./events");

// Redis
const RedisSub = require("./redis/sub");
const handleRedisEvent = require("./redis/handleRedisEvent");

/**
 * ============================
 * REDIS SUBSCRIPTIONS (GLOBAL)
 * ============================
 */
RedisSub.psubscribe("editor:*");
RedisSub.psubscribe("cursor:*");
RedisSub.psubscribe("presence:*");
RedisSub.psubscribe("chat:*");

RedisSub.on("pmessage", handleRedisEvent);

/**
 * ============================
 * WEBSOCKET SERVER
 * ============================
 */
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
      const msg = JSON.parse(data.toString());
      handleClientEvent(wss, ws, msg);
    });

    ws.on("close", () => {
      roomManager.handleDisconnect(wss, ws);
    });
  });

  return wss;
};