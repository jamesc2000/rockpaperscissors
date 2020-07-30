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
let serverSocket = new WebSocket("ws://104.215.158.150:80");
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
            break;
        case "ongoing":
            console.log(data);
            gameState = data;
            display(enemyName, data.players[(playerNumber + 1) % 2].name); // Display the other player's name
            startTimer();
            break;
        case "result":
            console.log(data);
            gameState = data;
            let winner = result(gameState);
            if (winner == -1) {
                console.log(winner);
                display(enemyName, "Tie!");
            } else {
                console.log(winner);
                display(enemyName, `Winner: ${gameState.players[winner].name}`);
            }
            break;
        default:
            console.log(data);
            break;
    }
};

// When joining game
let playerNumber;
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

// Wait for other player
let enemyName = document.querySelector("#enemyName");
async function start() {}

// Timer
let enemy = document.querySelector("#enemy");
let timer = document.querySelector("#timer");
function startTimer() {
    let timeLeft = 3;
    var time = setInterval(function() {
        // console.log("as");
        timer.innerHTML = timeLeft;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(time);
            // fetch("http://localhost/", postMe)
            //     .then(res => console.log(res))
            //     .catch(() => console.log("Error"));
        }
    }, 1000);

    // Randomize enemy display
    let curr = 0;
    var randomize = setInterval(function() {
        // console.log("heyo " + curr);
        enemy.innerHTML = controls[curr].innerHTML;
        curr++;

        if (curr == 3) {
            curr = 0;
        }

        // Remove this when we have a working backend
        // for testing purposes only
        if (timeLeft < 0) {
            clearInterval(randomize);
            decide(me.innerHTML); // The decision only gets sent to the server once after timer
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

// Log function for #enemyName
function display(field, message) {
    field.innerHTML = message;
}

// Send decision to server
function decide(decision) {
    gameState.event = "decision";
    gameState.playerNumber = playerNumber;
    gameState.players[playerNumber - 1].decision = decision;
    serverSocket.send(JSON.stringify(gameState));
}

// Result
function result(data) {
    display(enemy, data.players[playerNumber % 2].decision); // Display the other player's name
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
    } else if ((decision2 - decision1) % 3 >= 1) {
        return 1;
    } else if ((decision1 - decision2) % 3 >= 1) {
        return 0;
    }
}
