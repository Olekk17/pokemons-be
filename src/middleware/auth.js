const verifyToken = require("../helpers/verifyToken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const { success, walletAddress, message } = verifyToken(token);

  if (success) {
    req.walletAddress = walletAddress;
    return next();
  }

  return res.status(401).json({ message });
};

module.exports = authMiddleware;
