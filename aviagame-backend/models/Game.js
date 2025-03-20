const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  crashMultiplier: { type: Number, required: true }, // Коэффициент краша
  startedAt: { type: Date, required: true }, // Время старта раунда
  endedAt: { type: Date, required: true } // Время окончания раунда
});

module.exports = mongoose.model("Game", gameSchema);

