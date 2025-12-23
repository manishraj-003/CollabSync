const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwtUtil = require("../utils/jwt");

module.exports = {
  async signup(req, res) {
    const { name, email, password } = req.body;

    const exists = await User.findByEmail(email);
    if (exists) return res.status(400).json({ error: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.createUser(name, email, hashed);

    const token = jwtUtil.generate(user);
    res.json({ user, token });
  },

  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwtUtil.generate(user);
    res.json({ user, token });
  }
};
