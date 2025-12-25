const Redis = require("ioredis");
const roomManager = require("../roomManager");

const sub = new Redis(process.env.REDIS_URL);

sub.psubscribe("chat:*");

sub.on("pmessage", (pattern, channel, message) => {
  if (channel.startsWith("chat:")) {
    const docId = channel.split(":")[1];
    const data = JSON.parse(message);

    // 🔥 ONLY place where broadcast happens
    roomManager.broadcast(docId, data);
  }
});

module.exports = sub;
