require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDb = require("./src/config/db");

const authRoutes = require("./src/routes/auth");
const vaultRoutes = require("./src/routes/vault");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/vault", vaultRoutes);

const PORT = process.env.BACKEND_PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("DB connect failed:", err);
    process.exit(1);
  });
