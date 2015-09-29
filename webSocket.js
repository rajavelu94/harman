function init() {
    var online_Btn = document.getElementById('onlineBtn');
    online_Btn.onclick = getControl;
}

function getControl() {
    var socket = new WebSocket("ws://localhost:8081");
    setup()
}

function setup() {
    // The socket connection needs two event listeners:
    socket.onopen = openSocket;
}

function openSocket() {
    text.html("Socket open");
    socket.send("Hello server");
}