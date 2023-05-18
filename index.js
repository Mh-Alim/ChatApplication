const http = require("http");
const express = require("express");
const path = require("path");
const cors = require("cors");
const socketIo = require("socket.io");

const port = process.env.PORT || 4500;
const app = express();

const users = {};
const rooms = {};

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
    }
    else {
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
    }
    

    // for count of total user in room
    let room = data.roomId;
    let totUser = 0;
    for (let key in rooms) {
      if (rooms.hasOwnProperty(key)) {
        const getRoom = rooms[key];
        // Perform actions with key and value
        console.log(key, getRoom);
        if (getRoom === room) {
          totUser++;
        }
      }
    }
    console.log("total user " ,totUser);
    if (room) {
      io.to(room).emit("total-user", totUser);
    }
    else io.emit("total-user", totUser);

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
    // for count of total user in room
    let totUser = 0;
    for (let key in rooms) {
      if (rooms.hasOwnProperty(key)) {
        const getRoom = rooms[key];
        // Perform actions with key and value
        console.log(key, getRoom);
        if (getRoom === room) {
          totUser++;
        }
      }
    }
    console.log("total user " ,totUser);
    if (room) {
      io.to(room).emit("total-user", totUser);
    }
    else io.emit("total-user", totUser);
  });
  // broadcast me user ko chodke baaki sabhi ko message jaayega
});
app.use("/", express.static(path.join("./public/build")));

server.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});
