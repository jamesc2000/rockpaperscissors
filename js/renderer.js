// Put all things related to rendering
// things in the browser here

// Timer
let timer = document.querySelector("#timer");
let timeLeft = 3;
var time = setInterval(function() {
    console.log("as");
    timer.innerHTML = timeLeft;
    timeLeft--;

    if (timeLeft < 0) {
        clearInterval(time);
    }
}, 1000);
