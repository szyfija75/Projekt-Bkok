const mongoose = require("mongoose");

const EncSchema = new mongoose.Schema(
  {
    iv: { type: String, required: true },
    tag: { type: String, required: true },
    data: { type: String, required: true }
  },
  { _id: false }
);

const EntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    title: { type: String, required: true },
    username: { type: String, default: "" },
    url: { type: String, default: "" },
    notes: { type: String, default: "" },
    passwordEnc: { type: EncSchema, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entry", EntrySchema);
