const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = 3000;
const io = require("socket.io")();
io.listen(server);

let taxiSocket =null;

io.on("connection", socket =>{
    console.log("a user connected :D");
    socket.on("taxiRequest",routeResponse=>{
        console.log(routeResponse)
        if(taxiSocket != null){
            taxiSocket.emit("taxiRequest",routeResponse);
        }
    })

    socket.on("lockingForPassenger",msg=>{
        console.log('SommeOne locking for a passenger');
        taxiSocket = socket;
    })
})

server.listen(port,() => console.log("server running on port : " + port));
 