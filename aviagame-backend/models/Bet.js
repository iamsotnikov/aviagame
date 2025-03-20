const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  amount: { type: Number, required: true },
  cashOutAt: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Bet = mongoose.model("Bet", betSchema);
module.exports = Bet;

