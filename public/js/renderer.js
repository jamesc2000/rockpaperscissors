// This script is executed by the client in the browser
// 1. Open a websocket connection to the server
// 2. Send a message to the server that the connection was established
// 3. Listen for messages from the server with the events "playerNumber", "ongoing", and "result" (Server-fired events)
//      playerNumber - the server tells the client whether it is the 1st or 2nd player to join
//      ongoing      - tells the clients to start their timers
//                   - this is also the event where the names of the players are received and displayed on the client
//      result       - tells the clients the decisions of both players, when this fires the client evaluates who the winner is
//
// 4. Client-fired events
//      join         - tells the server the name of this player (fired when join button is pressed)
//      decide       - tells the server what the decision of this player is
// ---------------------------------------------------------

// Keep a local copy of the game state from server's response on event 'ongoing'
let gameState = {};

// Establish WebSocket connection
let serverSocket = new WebSocket(
    `wss://rockpaperscissors-server-app.herokuapp.com/}`
);
serverSocket.onopen = function(event) {
    let data = { message: "Connection established" };
    serverSocket.send(JSON.stringify(data));
    display(enemyName, "Connection established");
};

// Listen for WebSocket messages
serverSocket.onmessage = function(message) {
    let data = JSON.parse(message.data);
    switch (data.event) {
        case "playerNumber":
            playerNumber = data.playerNumber;
            gameState.index = data.index;
            enemyName.classList = "name"; // Reset colors of enemyName
            playerName.disabled = true; // Disable name input
            break;
        case "ongoing":
            if (data.index === gameState.index) {
                console.log(data);
                gameState = data;
                display(enemyName, data.players[playerNumber % 2].name); // Display the other player's name
                startTimer();
                randomize(); // Random effect on enemy's decision
            }
            break;
        case "result":
            if (data.index === gameState.index) {
                console.log(data);
                console.time("result");
                gameState = data;
                display(enemy, data.players[playerNumber % 2].decision); // Display the other player's decision
                let winner = result(gameState);
                if (winner == -1) {
                    console.log(winner);
                    display(enemyName, "Tie!");
                } else {
                    console.log(winner);
                    display(
                        enemyName,
                        `Winner: ${gameState.players[winner].name}`
                    );
                }

                if (winner == playerNumber - 1) {
                    playerWins.innerHTML++;
                    enemyName.classList += " win";
                } else {
                    enemyName.classList += " loss";
                }
                playerName.disabled = false;
                console.timeEnd("result");
            }
            break;
        default:
            console.log(data);
            break;
    }
};

// When joining game
let playerNumber;
const playerWins = document.querySelector("#playerWins");
const playerName = document.querySelector("#playerName");

function join() {
    let data = {
        event: "join",
        playerName: playerName.value
    };
    serverSocket.send(JSON.stringify(data));
    display(enemyName, "Waiting for other player to join");
}

let joinBtn = document.querySelector("#nameButton");
joinBtn.addEventListener("click", function() {
    join();
});
document.addEventListener("keydown", function(event) {
    if (event.keyCode == 13) {
        join();
    }
});

// Timer
let player = document.getElementsByClassName("player");
let enemyName = document.querySelector("#enemyName");
let enemy = document.querySelector("#enemy");
let timer = document.querySelector("#timer");
function startTimer() {
    let timeLeft = 2;
    var time = setInterval(function() {
        timer.innerHTML = timeLeft;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(time);
            decide(me.innerHTML); // The decision only gets sent to the server once after timer
        }
    }, 1000);
}

// Randomize enemy display
function randomize(toggle) {
    let curr = 0;
    var random = setInterval(function() {
        enemy.innerHTML = controls[curr].innerHTML;
        curr++;
        if (curr == 3) {
            curr = 0;
        }
        if (gameState.event != "ongoing") {
            clearInterval(random);
        }
    }, 100);
}

// Controls
let me = document.querySelector("#me");
let controls = document.querySelectorAll(".controls");
controls.forEach(element => {
    element.addEventListener("click", function() {
        me.innerHTML = this.innerHTML;
    });
});

// Display message on #enemyName
function display(field, message) {
    field.innerHTML = message;
}

// Send decision to server
function decide(decision) {
    console.time("sendDecision");
    gameState.event = "decision";
    gameState.playerNumber = playerNumber;
    gameState.players[playerNumber - 1].decision = decision;
    serverSocket.send(JSON.stringify(gameState));
    console.timeEnd("sendDecision");
}

// Result
function result(data) {
    let decision1 = data.players[0].decision;
    let decision2 = data.players[1].decision;
    let d = ["Rock", "Paper", "Scissors"];
    for (let i = 0; i < d.length; i++) {
        if (decision1 === d[i]) {
            decision1 = i;
        }
        if (decision2 === d[i]) {
            decision2 = i;
        }
    }
    if (decision1 === decision2) {
        return -1;
    } else if ((decision2 - decision1 + 3) % 3 == 1) {
        return 1;
    } else if ((decision1 - decision2 + 3) % 3 == 1) {
        return 0;
    }
}
