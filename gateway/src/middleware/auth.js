const jwtUtil = require("../utils/jwt");

module.exports = function verifyWsAuth(info, cb) {
  const url = new URL(info.req.url, "http://localhost");

  const token = url.searchParams.get("token");
  if (!token) return cb(false, 401, "Missing token");

  try {
    const user = jwtUtil.verify(token);
    info.req.user = user; // Attach user to request
    cb(true);
  } catch {
    cb(false, 401, "Invalid token");
  }
};
