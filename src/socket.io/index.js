const { Server } = require("socket.io");
const Game = require("../models/Game");
const User = require("../models/User");
const handleAttack = require("../helpers/handleAttack");
const verifyToken = require("../helpers/verifyToken");

const initSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("game_join", async (data) => {
      const game = await Game.findById(data.id);
      const walletAddress = verifyToken(data.token).walletAddress;
      if (!walletAddress) {
        console.log("Invalid token");
        return;
      }

      const user = await User.findOne({ walletAddress });
      if (!user) {
        console.log("User not found");
        return;
      }

      if (user._id.toString() !== game.userId.toString()) {
        console.log("Unauthorized");
        return;
      }

      socket.join(data.id);
      socket.emit("initial_game_data", game);
    });

    socket.on("game_attack", (data) => handleAttack(data.id, socket.server));

    socket.on("game_leave", (data) => {
      socket.leave(data.id);
    });
  });

  return io;
};

module.exports = initSocketIO;
