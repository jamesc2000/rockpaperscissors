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

const wss = new WebSocket.Server({ port: 80 });

wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        let data = JSON.parse(message);

        switch (data.event) {
            case "join":
                waiting.push(data.playerName);
                let res = {
                    event: "playerNumber",
                    playerNumber: waiting.length
                };
                ws.send(JSON.stringify(res));
                console.log(
                    `Player ${data.playerName} joined as player ${waiting.length}`
                );
                if (waiting.length == 2) {
                    let buffer = {
                        index: ongoingGames.length,
                        event: "ongoing",
                        players: [
                            {
                                num: 1,
                                name: waiting[0],
                                decision: ""
                            },
                            {
                                num: 2,
                                name: waiting[1],
                                decision: ""
                            }
                        ]
                    };
                    console.log(JSON.stringify(buffer));
                    ongoingGames.push(buffer);
                    waiting.length = 0;
                    console.log(`${ongoingGames.length} games ongoing`);
                    broadcast(buffer);
                } else {
                    // Send error to client to try to rejoin again
                }
                break;
            case "decision":
                console.log("Someone decided");
                // Update the server copy of the game data, in case
                // in the future i might add in server side game logic
                ongoingGames[data.index].players[
                    data.playerNumber - 1
                ].decision = data.players[data.playerNumber - 1].decision; //(index used to update only that specific game)
                setTimeout(() => {
                    broadcast(ongoingGames[data.index]);
                }, 500);

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

    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
