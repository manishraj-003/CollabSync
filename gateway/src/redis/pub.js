const Redis = require("ioredis");
const pub = new Redis(process.env.REDIS_URL);

module.exports = {
  publish(channel, message) {
    return pub.publish(channel, message);
  }
};
