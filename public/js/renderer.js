// Put all things related to rendering
// things in the browser here

// Local browser lifecycle
// 1. Join game
//    a. POST ${name}
//    b. Wait for game confirmation (GET request server periodically, then
//       wait for response: {player1Name, player2Name, playerNumber})
//       * player1Name, player2Name is needed for rendering name of other player on UI
// 2. Start timer on game start (on fulfillment of GET responses)
// 3. Player decides on rock, paper, or scissors
// 4. Send decision to server to be evaluated for win conditions
//    a. POST ${decision}
//    b. Wait for response on winner
//    c. Display response on UI
// 5a. Repeat
// 5b. onBeforeUnload detects when a player leaves the game, POST this to server to cancel match
//       * https://stackoverflow.com/questions/6895564/difference-between-onbeforeunload-and-onunload

// Establish WebSocket connection
let serverSocket = new WebSocket(
    "ws://rockpaperscissors-server-app.herokuapp.com/:8080"
);
serverSocket.onopen = function(event) {
    let data = { message: "Connection established" };
    serverSocket.send(JSON.stringify(data));
    display(enemyName, "Connection established");
};

let gameState = {}; // Keep a local copy of the game state from server's response on event 'ongoing'

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
        // console.log("as");
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
