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

const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

let waiting = [];
let ongoingGames = [];

const wss = new WebSocket.Server({ port: 380 });

wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        let data = JSON.parse(message);
        switch (data.event) {
            case "join":
                waiting.push(data.playerName);
                let buffer = {
                    event: "playerNumber",
                    playerNumber: waiting.length,
                    index: ongoingGames.length
                };
                ws.send(JSON.stringify(buffer));
                console.log(
                    `Player ${data.playerName} joined as player ${waiting.length}`
                );
                if (waiting.length == 2) {
                    let buffer = {
                        index: ongoingGames.length,
                        decided: 0,
                        players: [
                            {
                                num: 1,
                                name: waiting[0],
                                decision: "",
                                wins: 0
                            },
                            {
                                num: 2,
                                name: waiting[1],
                                decision: "",
                                wins: 0
                            }
                        ]
                    };
                    console.log(JSON.stringify(buffer));
                    ongoingGames.push(buffer);
                    waiting.length = 0;
                    console.log(`${ongoingGames.length} games ongoing`);
                    broadcast("ongoing", buffer);
                } else {
                    // Send error to client to try to rejoin again
                }
                break;
            case "decision":
                let currDecision = data.players[data.playerNumber - 1].decision;
                currGame = ongoingGames[data.index];
                currGame.players[data.playerNumber - 1].decision = currDecision;
                currGame.decided++; // Having a counter for each player decided is faster than checking the strings if empty
                let d1 = currGame.players[0].decision;
                let d2 = currGame.players[1].decision;
                // console.time("if");
                if (currGame.decided == 2) {
                    broadcast("result", ongoingGames[data.index]);
                    console.log(JSON.stringify(ongoingGames[data.index]));
                    // console.timeEnd("if");
                }
                break;
            default:
                console.log(`Client: ${data.message}`);
                break;
        }
    });
});

function broadcast(event, message) {
    // Broadcast to all clients the game state
    // (rework this later to only broadcast to relevant clients)
    message.event = event;
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
