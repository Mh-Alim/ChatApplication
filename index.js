const http = require("http")
const express = require("express");
const cors = require("cors")
const socketIo = require("socket.io")

const port = process.env.PORT || 4500;
const app = express();

const users = [{}];
app.get("/",(req,res)=>{
    res.send("running  on this root");
})


const server = http.createServer(app);
const io = socketIo(server);

io.on("connection",(socket)=>{
    console.log("new connection ");
    

    socket.on('joined',(data)=>{
        users[socket.id] = data.user;
        console.log(`${data.user} is joined`);
        socket.broadcast.emit('userJoined',{user:"Admin",message:`${users[socket.id]} has joined`})
        socket.emit('Welcome',{user:"Admin",message: `Welcome to the chat.${users[socket.id]}`})
    })
    
    socket.on('message',({message,id})=>{
        io.emit('sendMessage',{user:users[id],message,id});
    });


    socket.on('disconnect',()=>{
        socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]}  has left`});
      console.log(`user left`);
  })
    // broadcast me user ko chodke baaki sabhi ko message jaayega
    
})

server.listen(port,()=>{
    console.log(`server is listening on http://localhost:${port}`);
})