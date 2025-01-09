const { Router } = require("express");
const { createGame, userOngoingGame } = require("../controllers/GameController");
const authMiddleware = require("../middleware/auth");

const router = Router();

router.use(authMiddleware);

router.post("/create/:pokemonId", createGame);
router.get("/ongoingGame", userOngoingGame);

module.exports = router;
