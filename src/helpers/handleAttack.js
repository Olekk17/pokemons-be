const Pokemon = require("../models/Pokemon");
const Game = require("../models/Game");
const getPokemonLevel = require("./getPokemonLevel");

const handleAttack = async (gameId, socket, skipCheck = false) => {
  const game = await Game.findById(
    gameId,
    "currentTurn pokemonId opponentId hp"
  );
  console.log("handleAttack", game);
  if (!game) {
    return;
  }

  if (String(game.currentTurn) !== String(game.pokemonId) && !skipCheck) {
    console.log("Not my turn");
    return;
  }
  const updateResult = await Game.updateOne(
    { _id: gameId, attacking: { $ne: true }, status: "ongoing" },
    { attacking: true }
  );

  if (!updateResult.modifiedCount) {
    console.log("Already attacking");
    return;
  }
  const attacker = game.currentTurn;
  const pokemon = await Pokemon.findById(attacker);
  const opponentId =
    attacker === game.pokemonId ? game.opponentId : game.pokemonId;

  if (!pokemon) {
    return;
  }

  const level = getPokemonLevel(pokemon); // There is no direct level set in the Pokemon model
  const attack = pokemon.base.Attack;
  const defense = pokemon.base.Defense;
  const randomFactor = Number(Math.random().toFixed(2));
  const damage = Math.floor(
    ((((2 * level) / 5 + 2) * 50 * (attack / defense)) / 50 + 2) * // Power is missing in the Pokemon model
      randomFactor
  );

  const event = {
    _id: attacker,
    damage,
    timestamp: new Date(),
  };
  const newCurrentTurnValue =
    String(game.currentTurn) === String(game.pokemonId)
      ? String(game.opponentId)
      : String(game.pokemonId);

  const newHp = {
    ...game.hp,
    [newCurrentTurnValue]: game.hp[newCurrentTurnValue] - damage,
  };

  await Game.updateOne(
    { _id: gameId },
    {
      $push: { turns: event },
      $set: {
        attacking: false,
        currentTurn: newCurrentTurnValue,
        hp: newHp,
      },
    }
  );

  socket.to(String(gameId)).emit("game_update", {
    lastEvent: event,
    hp: newHp,
    currentTurn: newCurrentTurnValue,
  });

  if (Object.values(newHp).some((hp) => hp <= 0)) {
    await Game.updateOne(
      { _id: gameId },
      {
        status: "finished",
      }
    );
  }

  if (opponentId !== game.pokemonId || skipCheck) {
    return;
  }

  const timeoutToOpponent = Math.random() * 7000 + 4000;

  setTimeout(() => {
    handleAttack(gameId, socket, true);
  }, timeoutToOpponent);
};

module.exports = handleAttack;
