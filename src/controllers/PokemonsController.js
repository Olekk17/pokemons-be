const Pokemon = require("../models/Pokemon");

const getPokemons = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const pokemons = await Pokemon.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Pokemon.countDocuments();

    res.json({
      data: pokemons,
      hasNextPage: count > page * limit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPokemonsByIds = async (req, res) => {
  try {
    const pokemonIds = req.body.ids;
    if (!pokemonIds || !Array.isArray(pokemonIds)) {
      return res.status(400).json({ error: "Invalid pokemon IDs" });
    }

    const pokemons = await Pokemon.find({ _id: { $in: pokemonIds } });

    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPokemons,
  getPokemonsByIds,
};
