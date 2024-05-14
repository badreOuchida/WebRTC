require("dotenv").config();
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = require("http").createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});
const PORT = 8000 || process.env.PORT;
io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("message", (message) => {
    socket.broadcast.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

function error(err, req, res, next) {
  // log it
  if (!test) console.error(err.stack);

  // respond with 500 "Internal Server Error".
  res.status(500);
  res.send("Internal Server Error");
}
app.use(error);
server.listen(PORT, () => {
  console.log("listening on Port : " + PORT);
});
