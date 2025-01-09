const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  try {
    const data = jwt.verify(token, process.env.SECRET_KEY);
    if (!data) {
      return { success: false, message: "Invalid token" };
    }

    if (data.exp < Date.now().valueOf() / 1000) {
      return { success: false, message: "Token expired" };
    }
    return { success: true, walletAddress: data.walletAddress, message: "Token verified" };
  } catch (e) {
    console.error("Error in verifyToken", e);
    return { success: false, message: "Invalid token" };
  }
};

module.exports = verifyToken;
