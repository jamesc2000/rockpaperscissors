// This is the WebSocket server running on the server
// The game state object is stored on the array ongoingGames, with its index accessible to the object
// Structure of gameState:
// {
//   index: *this object's index on the ongoingGames array*,
//   decided: *this number denotes how many players have sent their decisions,
//   players: [
//     {
//       num: *playerNumber,
//       name: *name of the player,
//       decision: *whether the player chose rock/paper/scissors,
//       wins: *to be implemented
//     },
//     {
//       *repeat for second player
//     }
//   ]
// }
//

console.log("Server running");

const WebSocket = require("ws");
const express = require("express");
const http = require("http");

let waiting = [];
let ongoingGames = [];

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        let data = JSON.parse(message);
        switch (data.event) {
            case "join":
                // When a user clicks join, they get added to an array of waiting players
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
                // Once that array has 2 players, the server creates a game that is stored in
                // ongoingGames. Then the server broadcasts the gameState for their specific game
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
                    // TODO: Send error to client to try to rejoin again
                }
                break;
            case "decision":
                // Updates the current gameState for their respective game when a user decides
                let currDecision = data.players[data.playerNumber - 1].decision;
                currGame = ongoingGames[data.index];
                currGame.players[data.playerNumber - 1].decision = currDecision;
                currGame.decided++; // Having a counter for each player decided is faster than checking the strings if empty
                let d1 = currGame.players[0].decision;
                let d2 = currGame.players[1].decision;
                if (currGame.decided == 2) {
                    broadcast("result", ongoingGames[data.index]);
                    console.log(JSON.stringify(ongoingGames[data.index]));
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

// Tells the express server to listen at the port heroku declared or 8080
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
