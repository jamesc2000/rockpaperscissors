import { start } from "repl";

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

// When joining game
let playerNumber;
let matchState = {};

async function join() {
    let playerData = {
        name: document.querySelector("#playerName").value
    };
    let data = {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(playerData)
    };
    // fetch("http://localhost/join", data)
    //     .then(res => {
    //         res.json().then(data => {
    //             console.log(data);
    //             if (data.playerNumber == 2) {
    //                 startTimer();
    //                 console.log("Match confirmed");
    //                 matchState = data;
    //                 enemyName.innerHTML = matchState.playerData.p1.name;
    //             } else {
    //                 wait();
    //                 console.log("Waiting for other player");
    //             }
    //         });
    //     })
    //     .catch(error => console.error("Error: ", error));
    let response = await fetch("http://localhost/join", data);
    if (response.status != 200) {
        console.error("Error: ", response.statusText);
    } else {
        response
            .json()
            .then(data => {
                console.log(data);
                playerNumber = data.playerNumber;
            })
            .then(() => {
                start();
            });
    }
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
async function start() {
    let data = {
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ playerNumber: playerNumber })
    };
    let response = await fetch("http://localhost/start", data);
    if (response.status != 200) {
        console.error("Error: ", response.statusText);
    } else {
    }
}

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
        }
    }, 100);
}

// Controls
let me = document.querySelector("#me");
let controls = document.querySelectorAll(".controls");
controls.forEach(element => {
    element.addEventListener("click", function() {
        // console.log("A control was clicked! " + this.innerHTML);
        me.innerHTML = this.innerHTML;
        decide(me.innerHTML);
    });
});

// POST decision to server
function decide(decision) {
    if (matchState.playerNumber == 1) {
        matchState.playerData.p1.decision = decision;
    } else if (matchState.playerNumber == 2) {
        matchState.playerData.p2.decision = decision;
    }
    let data = {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(matchState)
    };
    fetch("http://localhost/decision", data)
        .then(res => {})
        .catch(error => console.error("Error: ", error));
    console.log("Sent decision");
    console.log(matchState);
}
