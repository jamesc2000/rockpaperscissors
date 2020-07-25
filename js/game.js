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

let matchState = {
    playerData: {
        p1: {
            name: "",
            decision: ""
        },
        p2: {
            name: "",
            decision: ""
        }
    }
};
let players = [];

server.use(cors());
server.use(bodyParser.json({ extended: true }));

server.post("/join", (req, res) => {
    console.log(`Player ${req.body.name} joined`);
    players.push(req.body.name);

    if (players.length == 2) {
        console.log("Starting game");
        // let match = {
        //     playerData: {
        //         p1: {
        //             name: players[0],
        //             decision: ""
        //         },
        //         p2: {
        //             name: players[1],
        //             decision: ""
        //         }
        //     },
        //     playerNumber: 2
        // };

        matchState.playerData.p2.name = players[1];
        matchState.playerNumber = 2;
        res.json(matchState);
        console.log(JSON.stringify(matchState));
    } else if (players.length == 1) {
        let match = {
            playerData: {
                p1: {
                    name: players[0],
                    decision: ""
                }
            },
            playerNumber: 1
        };

        matchState.playerData.p1.name = players[0];
        matchState.playerNumber = 1;
        res.json(matchState);
        console.log(JSON.stringify(matchState));
    }
});

server.get("/confirm", (req, res) => {
    console.log("Get request received");
    if (players.length == 2) {
        let match = {
            playerData: {
                p1: {
                    name: players[0],
                    decision: ""
                },
                p2: {
                    name: players[1],
                    decision: ""
                }
            },
            playerNumber: 1
        };
        matchState.playerNumber = 1;
        res.json(matchState);
        console.log("Response sent");
        players.length = 0;
    }
});

server.post("/decision", (req, res) => {
    if (req.body.playerNumber == 1) {
        matchState.playerData.p1.decision = req.body.playerData.p1.decision;
        console.log(JSON.stringify(matchState));
    } else if (req.body.playerNumber == 2) {
        matchState.playerData.p2.decision = req.body.playerData.p2.decision;
        console.log(JSON.stringify(matchState));
    }
});

server.listen(80, () => console.log("Server listening on port 80"));
