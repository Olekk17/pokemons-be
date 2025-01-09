const Pokemon = require("../models/Pokemon");
const User = require("../models/User");
const Game = require("../models/Game");
const handleAttack = require("../helpers/handleAttack");

const createGame = async (req, res) => {
  try {
    const pokemonId = req.params.pokemonId;

    if (!pokemonId) {
      return res.status(400).json({ error: "Pokemon ID is required" });
    }

    const pokemon = await Pokemon.findById(pokemonId);
    if (!pokemon) {
      return res.status(404).json({ error: "Pokemon not found" });
    }

    const opponentCount = await Pokemon.countDocuments({
      type: { $nin: pokemon.type },
    });

    const randomIndex = Math.floor(Math.random() * opponentCount);

    const opponent = await Pokemon.findOne({
      type: { $nin: pokemon.type },
    }).skip(randomIndex);

    if (!opponent) {
      return res.status(404).json({ error: "Opponent not found" });
    }

    // Determine who plays first, if speed is the same, randomly choose
    const firstPlayer =
      pokemon.base.Speed === opponent.base.Speed
        ? Math.random() > 0.5
          ? pokemon
          : opponent
        : pokemon.base.Speed > opponent.base.Speed
        ? pokemon
        : opponent;

    const user = await User.findOne({ walletAddress: req.walletAddress });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const game = {
      userId: user._id,
      pokemonId: pokemon._id,
      opponentId: opponent._id,
      status: "ongoing",
      currentTurn: firstPlayer._id,
      turns: [],
      hp: {
        [String(pokemon._id)]: pokemon.base.HP,
        [String(opponent._id)]: opponent.base.HP,
      },
    };

    const newGame = await Game.create(game);

    setTimeout(() => {
      handleAttack(newGame._id, req.app.get("socketio"), true);
    }, 10000);

    return res.json({ message: "Game created successfully", id: newGame._id });
  } catch (error) {
    res.status(500).json({
      error: error?.message || "Something went wrong while creating the game",
    });
  }
};

const userOngoingGame = async (req, res) => {
  const walletAddress = req.walletAddress;
  const user = await User.findOne({ walletAddress });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const game = await Game.findOne(
    { userId: user._id, status: "ongoing" },
    "_id"
  );

  if (!game) {
    return res.status(404).json({ error: "No ongoing game found" });
  }

  return res.json({ id: game._id });
};

module.exports = {
  createGame,
  userOngoingGame,
};
