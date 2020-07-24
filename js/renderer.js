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
function join() {
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
    fetch("http://localhost/join", data)
        .then(res => {
            res.json().then(data => {
                console.log(data);
                if (data.playerNumber == 2) {
                    startTimer();
                    console.log("Match confirmed");
                } else {
                    wait();
                    console.log("Waiting for other player");
                }
            });
        })
        .catch(error => console.error("Error: ", error));
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
function wait() {
    let data = {
        method: "GET",
        mode: "cors",
        credentials: "same-origin"
    };
    var waitLoop = setInterval(function() {
        console.log("Get request sent");
        fetch("http://localhost/confirm", data)
            .then(res => {
                console.log("Match confirmed");
                startTimer();
                clearInterval(waitLoop);
            })
            .catch(() => {
                console.log("Waiting for other player");
                wait();
            });
    }, 7 * 1000);
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
    });
});
