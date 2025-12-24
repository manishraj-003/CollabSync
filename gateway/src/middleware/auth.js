const jwtUtil = require("../utils/jwt");

module.exports = function verifyWsAuth(info, cb) {
  if (!info || !info.req || !info.req.url) {
    return cb(false, 400, "Invalid WS request");
  }

  try {
    const url = new URL(info.req.url, "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
      return cb(false, 401, "Missing token");
    }

    const user = jwtUtil.verify(token);
    info.req.user = user;
    cb(true);
  } catch (err) {
    cb(false, 401, "Invalid token");
  }
};
