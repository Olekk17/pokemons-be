const { Router } = require("express");
const {
  getPokemons,
  getPokemonsByIds,
} = require("../controllers/PokemonsController");
const authMiddleware = require("../middleware/auth");

const router = Router();

router.use(authMiddleware);

router.get("/", getPokemons);

router.post("/getPokemonsByIds", getPokemonsByIds);

module.exports = router;
