const express = require("express");
const app = express();
const server = require("http").createServer(app);
//const io = require("socket.io").listen(server);
const port = 3000;
const io = require("socket.io")();
io.listen(server);
io.on("connection", socket =>{
    console.log("a user connected :D");
    socket.on("chat message",msg=>{
        console.log(msg);
        io.emit("chat message",msg);
    })
})

server.listen(port,() => console.log("server running on port : " + port));
 