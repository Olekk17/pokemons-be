const express = require("express");
const cors = require("cors");
const pokemonsRouter = require("./routes/pokemons");
const authRouter = require("./routes/auth");
const gameRouter = require("./routes/game");
const connectDB = require("./config/database");
const http = require("http");
const initSocketIO = require("./socket.io");
require("dotenv").config();

const main = async () => {
  const port = process.env.PORT || 8082;
  const app = express();
  const server = http.createServer(app);
  const io = initSocketIO(server);

  app.set("socketio", io);

  app.use(cors());

  app.use(express.json());

  await connectDB();

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  app.use("/pokemons", pokemonsRouter);
  app.use("/auth", authRouter);
  app.use("/game", gameRouter);
};

main();
