// This file is ran by the server, this opens up endpoints
// for the rest api and also handles game state and logic

// Game lifecycle should be
// 1. Wait for 2 players to join
// 2. Start game
// 3. Evaluate win conditions
// 4. Check if a player left the game

// Game outcomes
// 1. Player 1 win / other player left midgame
// 2. Player 2 win / other player left midgame
// 3. Draw/No Win

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

    // function createMatch() {
    //     return new Promise((resolve, reject) => {
    //         let match = {
    //             timestamp: Date.now(),
    //             playerData: {
    //                 p1: await players[0],
    //                 p2: await players[1]
    //             }
    //         };
    //         resolve(match)
    //     })
    // }

    // async function createMatch() {
    //     let match = {
    //         timestamp: Date.now(),
    //         playerData: {
    //             p1: await players[0],
    //             p2: await players[1]
    //         }
    //     };
    //     return match;
    // }

    // createMatch().then(match => {
    //     res.json(match);
    // });

    if (players.length == 2) {
        console.log("Starting game");
        let match = {
            playerData: {
                p1: players[0],
                p2: players[1]
            },
            playerNumber: 2
        };
        res.json(match);
        console.log(JSON.stringify(match));
    } else {
        let match = {
            playerData: {
                p1: players[0]
            },
            playerNumber: 1
        };
        res.json(match);
        console.log(JSON.stringify(match));
    }
});

server.get("/confirm", (req, res) => {
    console.log("Get request received");
    if (players.length == 2) {
        let match = {
            playerData: {
                p1: players[0],
                p2: players[1]
            },
            playerNumber: 1
        };
        res.json(match);
    }
});

server.listen(80, () => console.log("Server listening on port 80"));
