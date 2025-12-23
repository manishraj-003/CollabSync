const Redis = require("ioredis");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const pub = new Redis(process.env.REDIS_URL);

pub.on("connect", () => {
  console.log("✅ Redis publisher connected");
});

pub.on("error", (err) => {
  console.error("❌ Redis publisher error:", err);
});

module.exports = pub;
