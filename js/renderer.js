// Put all things related to rendering
// things in the browser here

// When joining game
function join() {
    let playerData = {
        name: "James"
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
                console.log(data.pos);
            });
        })
        .catch(error => console.error("Error: ", error));
}
join();

// When quitting game

// Timer
let timer = document.querySelector("#timer");
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

// Controls
let me = document.querySelector("#me");
let controls = document.querySelectorAll(".controls");
controls.forEach(element => {
    element.addEventListener("click", function() {
        // console.log("A control was clicked! " + this.innerHTML);
        me.innerHTML = this.innerHTML;
    });
});

// Randomize enemy display
let enemy = document.querySelector("#enemy");
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
