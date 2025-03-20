const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  telegramId: { type: String, unique: true, sparse: true }, // Добавили поле
  balance: { type: Number, default: 1000 },
});

module.exports = mongoose.model("Player", playerSchema);

