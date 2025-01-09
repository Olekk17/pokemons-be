const User = require("../models/User");
const Web3 = require("web3");
const jwt = require("jsonwebtoken");

const getNonce = async (req, res) => {
  const { walletAddress } = req.params;

  if (!Web3.utils.isAddress(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  let user = await User.findOne({ walletAddress });
  if (!user) {
    user = new User({
      walletAddress,
      nonce: Math.random().toString(36).substr(2, 8),
    });
  } else {
    user.nonce = Math.random().toString(36).substr(2, 8);
  }

  await user.save();

  res.json({ nonce: user.nonce });
};
const verifySignature = async (req, res) => {
  const { walletAddress, signature } = req.body;

  if (!walletAddress || !signature) {
    return res
      .status(400)
      .json({ error: "Wallet address and signature are required" });
  }

  const user = await User.findOne({ walletAddress });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const message = `Authenticate with nonce: ${user.nonce}`;
  const recoveredAddress = Web3.utils.toChecksumAddress(
    Web3.eth.accounts.recover(message, signature)
  );

  if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
    user.nonce = null;
    await user.save();

    const token = jwt.sign(
      { walletAddress: user.walletAddress },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    return res.json({ success: true, token });
  }

  res.status(401).json({ error: "Invalid signature" });
};

module.exports = {
  getNonce,
  verifySignature,
};
