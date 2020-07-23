// This file is ran by the server, this opens up endpoints
// for the rest api and also handles game state and logic

console.log("Server running");

let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let server = express();

let players = [];

server.use(cors());
server.use(bodyParser.json({ extended: true }));

server.post("/join", (req, res) => {
    console.log(`Player ${req.body.name} joined`);
    players.push(req.body);
    res.send({ pos: players.length }); // TODO: This should be a json response using res.json()
    if (players.length == 2) {
        console.log("Starting game");
        let match = {
            timestamp: Date.now(),
            playerData: {
                p1: players[0],
                p2: players[1]
            }
        };
        players.length = 0;
        console.log(JSON.stringify(match));
    }
});

server.listen(80, () => console.log("Server listening on port 80"));
