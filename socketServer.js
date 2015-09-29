var WebSocketServer = require('websocket').server;
var wss = new WebSocketServer();
//var PORT = 8081;               // port number for the webSocket server
//var wss = new Server(PORT); // the webSocket server
//var connections = new Array;          // list of connections to the server

//wss.on('connection',handleConnection);
//wss.listen(8081);
//console.log("Server running");
wss.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin 
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

wss.broadcast('hello from server');
function handleConnection(client) {
    console.log("New Connection"); // you have a new client
    connections.push(client); // add this client to the connections array

    client.on('message', sendToSerial); // when a client sends a message,
    client.on('close', function () { // when a client closes its connection
        console.log("connection closed"); // print it out
        var position = connections.indexOf(client); // get the client's position in the array
        connections.splice(position, 1); // and delete it from the array
    });
}

function sendToSerial(data) {
   console.log("sending to serial: " + data);
    //myPort.write(data);
}

function sendData() {
    wss.on('open', function (client) {
        client.send('10932');
    })
}
