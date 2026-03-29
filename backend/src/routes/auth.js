const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required" });
  if (String(password).length < 6) return res.status(400).json({ error: "password too short" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: "user exists" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });
  return res.json({ id: user._id, email: user.email });
});

router.post("/login", async (req, res) => {
  const { email, password, twoFactorCode } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email & password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "bad credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "bad credentials" });

  if (twoFactorCode !== "123456") {
    return res.status(401).json({ error: "Nieprawidłowy kod 2FA" });
  }

  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: String(user._id), expiresIn: "2h" });
  return res.json({ token });
});

module.exports = router;