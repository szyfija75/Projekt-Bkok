const express = require("express");
const auth = require("../middleware/auth");
const Entry = require("../models/Entry");
const { encryptText, decryptText } = require("../utils/crypto");

const router = express.Router();
router.use(auth);

// LIST (bez ujawniania hasła)
router.get("/", async (req, res) => {
  const entries = await Entry.find({ userId: req.user.id })
    .sort({ updatedAt: -1 })
    .select("_id title username url notes createdAt updatedAt");
  res.json(entries);
});

// CREATE
router.post("/", async (req, res) => {
  const { title, username = "", url = "", notes = "", password } = req.body || {};
  if (!title || !password) return res.status(400).json({ error: "title & password required" });

  const passwordEnc = encryptText(password);
  const entry = await Entry.create({
    userId: req.user.id,
    title,
    username,
    url,
    notes,
    passwordEnc
  });

  res.json({ id: entry._id });
});

// UPDATE (opcjonalnie zmiana hasła)
router.put("/:id", async (req, res) => {
  const { title, username, url, notes, password } = req.body || {};

  const entry = await Entry.findOne({ _id: req.params.id, userId: req.user.id });
  if (!entry) return res.status(404).json({ error: "not found" });

  if (title !== undefined) entry.title = title;
  if (username !== undefined) entry.username = username;
  if (url !== undefined) entry.url = url;
  if (notes !== undefined) entry.notes = notes;
  if (password !== undefined && String(password).length > 0) entry.passwordEnc = encryptText(password);

  await entry.save();
  res.json({ ok: true });
});

// DELETE
router.delete("/:id", async (req, res) => {
  const out = await Entry.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ deleted: out.deletedCount === 1 });
});

// REVEAL (zwraca odszyfrowane hasło) — dydaktycznie OK, produkcyjnie raczej NIE
router.get("/:id/reveal", async (req, res) => {
  const entry = await Entry.findOne({ _id: req.params.id, userId: req.user.id });
  if (!entry) return res.status(404).json({ error: "not found" });

  const plain = decryptText(entry.passwordEnc);
  res.json({ password: plain });
});

module.exports = router;
