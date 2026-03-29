const mongoose = require("mongoose");

module.exports = async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in env");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("Mongo connected");
};
