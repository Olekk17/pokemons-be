const { Router } = require("express");
const { getNonce, verifySignature } = require("../controllers/AuthController");

const router = Router();

router.get("/nonce/:walletAddress", getNonce);

router.post("/verify", verifySignature);

module.exports = router;
