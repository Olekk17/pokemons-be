const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const turnSchema = new Schema({
  pokemonId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  damage: { type: Number, required: true },
});

const gameSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  pokemonId: { type: Schema.Types.ObjectId, ref: "Pokemon", required: true },
  opponentId: { type: Schema.Types.ObjectId, ref: "Opponent", required: true },
  status: { type: String, default: "pending" },
  currentTurn: { type: Schema.Types.ObjectId, ref: "Pokemon", required: true },
  turns: [turnSchema],
  attacking: { type: Boolean, default: false },
  hp: { type: Object, required: true },
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
