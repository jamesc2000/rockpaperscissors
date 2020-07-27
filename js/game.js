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

let waiting = [];
let ongoingMatches = [];
let matchState = {
    playerData: {}
};

server.use(cors());
server.use(bodyParser.json({ extended: true }));

server.post("/join", async (req, res) => {
    console.log(`Player ${req.body.name} joined`);
    waiting.push(req.body.name);
    console.log(`${waiting.length} player waiting`);
    if (waiting.length == 1) {
        matchState.playerData.p1 = { name: req.body.name };
        res.json({ playerNumber: 1 });
    } else if (waiting.length == 2) {
        matchState.playerData.p2 = { name: req.body.name };
        res.json({ playerNumber: 2 });
    }
});

server.get("/start", async (req, res) => {
    if (req.body.playerNumber == 1) {
        if (matchState.playerData.p2 != undefined) {
            setTimeout(() => {
                res.json(matchState);
            }, 3 * 1000);
        }
    }
});

server.post("/decision", (req, res) => {});

server.listen(80, () => console.log("Server listening on port 80"));
