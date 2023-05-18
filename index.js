const http = require("http");
const express = require("express");
const path = require("path");
const cors = require("cors");
const socketIo = require("socket.io");

const port = process.env.PORT || 4500;
const app = express();

const users = {};
const rooms = {};
app.get("/", (req, res) => {
  res.send("running  on this root");
});

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("new connection ");

  socket.on("joined", (data) => {
    if (data.roomId) {
      console.log("joined if ke ander");
      let room = data.roomId;

      socket.leaveAll();
      socket.join(room);
      rooms[socket.id] = room;
      users[socket.id] = data.user;
      console.log(socket.id);
      console.log(`${data.user} is joined`);
      socket.broadcast.to(room).emit("userJoined", {
        user: "Admin",
        message: `${users[socket.id]} has joined`,
      });
      socket.emit("Welcome", {
        user: "Admin",
        message: `Welcome to the chat ${users[socket.id]}`,
      });
      return;
    }
    console.log("joined down");
    rooms[socket.id] = "";
    users[socket.id] = data.user;
    console.log(socket.id);
    console.log(`${data.user} is joined`);
    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has joined`,
    });
    socket.emit("Welcome", {
      user: "Admin",
      message: `Welcome to the chat ${users[socket.id]}`,
    });
  });

  socket.on("message", ({ message, id, roomId }) => {
    if (roomId) {
      io.to(roomId).emit("sendMessage", { user: users[id], message, id });
      return;
    }
    io.emit("sendMessage", { user: users[id], message, id });
  });

  socket.on("disconnect", () => {
    let room = rooms[socket.id]; // something

    if (room) {
      socket.to(room).emit("leave", {
        user: "Admin",
        message: `${users[socket.id]}  has left`,
      });
      console.log(`${users[socket.id]} has left`);
      delete rooms[socket.id];
      delete users[socket.id];
    } else {
      socket.broadcast.emit("leave", {
        user: "Admin",
        message: `${users[socket.id]}  has left`,
      });
      console.log(`user left`);
      delete rooms[socket.id];
      delete users[socket.id];
    }
  });
  // broadcast me user ko chodke baaki sabhi ko message jaayega
});
app.use("/", express.static(path.join("./public/build")));

server.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});
