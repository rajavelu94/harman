var WebSocketServer = require("websocketserver");
var SERVER_PORT = 8081;               // port number for the webSocket server
var wss = new WebSocketServer("none", SERVER_PORT); // the webSocket server
var connections = new Array;          // list of connections to the server
var id_web;
var onlineFlag;


// Accept Connections
//wss.on("connection",handleConnection);
wss.on("connection", function (id) {
    connections.push(id);
    console.log('New Connection')
    onlineFlag = true;
    console.log(id);
    id_web = id;
});
console.log("Server running")

// Receive Message from browser
wss.on("message", function (data, id) {
    var mes = wss.unmaskMessage(data);
    var str = wss.convertToString(mes.message);
    sendToSerial(str);
});

// Closing Connection
wss.on("closedconnection", function (id) {
    console.log("Connection " + id + " has left the server");
});


// Send data to browser
function sendToBrowser(data) {
    //data = wss.packageMessage(data);
    wss.sendMessage("one", data, id_web);
}

// serial port initialization:
var SerialPort = require("serialport").SerialPort;

var myPort = new SerialPort(process.argv[2], {
    baudrate: 115200

});
// open the serial port:
var alive_flag;
var count;
var i = 0;
var j = 0;
var rx_data;
var reset = new Buffer("0A1FFF0006000D", 'hex')
var grabControl = new Buffer("0A000000D0000D", 'hex');
var alive = new Buffer("0A000000D6000D", 'hex');
var cmdLogin = new Buffer("0A00810026000D", 'hex');
var reqRing = new Buffer("0A0000002C000D", 'hex');
var alloca = new Buffer("0A000000020000300D", 'hex');
var dealloca = new Buffer("0A0081000200020D", 'hex');
var packet = new Buffer("00000000000000", 'hex');
var queueData = new Buffer(0);
var nU = 0;
myPort.on('open', function () {
    myPort.on('data', function (data) {
        //rxData = data;
        console.log('>>>>>', data);
        // console.log(rx_data)
        rx_data = true;
        // queueData = data;
        queueData = Buffer.concat([queueData, data])
       // setTimeout(packetData(queueData), 10);
        packetData(queueData);
    });
});

function packetData(data) {

    i = 0;
    // console.log(data);
    //    console.log(i);
    while (data[i] == 0x0a) {

        while (data[i] != 0x0d && i <= data.length) {
            packet[j] = data[i];
            j++;
            i++;
        }
        //console.log(i);
        //console.log(j);
        packet[j] = data[i];
        // console.log('PACKET>>>', packet);        
        if (packet[j] == 0x0d) {
            sendPacket = packet.slice(0, j + 1);
            queueData = queueData.slice(i + 1);
            //   console.log('SENDPACKET>>>', sendPacket);
            processData(sendPacket);
            j = 0;
            packet = new Buffer("000000000000000000000000000000", 'hex');
        }
        i++;
    }
   packet = new Buffer("000000000000000000000000000000", 'hex');
    j = 0;

    //}
}

function processData(data) {
    if (data[4] == 0x01 && data[6] == 0x01) {
        console.log('Allocating to ' + data[1] + data[2]);
        mes = alloca;
        mes[1] = data[1];
        mes[2] = data[2];
        myPort.write(mes);
        sendToBrowser('alloc' + data[1] + data[2]);

    }
    if (data[4] == 0x01 && data[6] == 0x00) {
        console.log('Deallocating mic' + data[1] + data[2]);
        mes = dealloca;
        mes[1] = data[1];
        mes[2] = data[2];
        myPort.write(mes);
        sendToBrowser('deall' + data[1] + data[2]);
        //myPort.write(new Buffer("0A0081000200020D", 'hex'));
    }
    if ((data[4] == 0x27) && rx_data) {
        checkDelegates(data[2]);
        if (data[2] < nU) {
            checkUnit(data[2]);
        }
    }
    if ((data[4] == 0x2d) && rx_data) {
        console.log('Ring Status');
        console.log(data[10]);
        nU = data[10];
        checkUnit(128);

    }
    // console.log(rx_data)
}
/*
 function handleConnection(client) {
    console.log("New Connection"); // you have a new client
    connections.push(client); // add this client to the connections array
    client.send('hello from handleConnections');
    
    client.on('message', sendToSerial); // when a client sends a message,
    client.on('close', function () { // when a client closes its connection
        console.log("connection closed"); // print it out
        var position = connections.indexOf(client); // get the client's position in the array
        connections.splice(position, 1); // and delete it from the array
    });
    
}
*/
function sendToSerial(mes) {
    data = (mes[0] + mes[1] + mes[2] + mes[3] + mes[4]);
    src = mes[5] + mes[6];
    src = new Buffer(src, 'hex');
    //console.log(src);
    //console.log(mes);
    if ('close' == data) {
        console.log('Unloading Resources and closing');
        // Close serial Port
        myPort.on('close', showPortClose);
        // when a client closes its connection
        client.on('close', function () {
            console.log("connection closed"); // print it out
            var position = connections.indexOf(client); // get the client's position in the array
            connections.splice(position, 1); // and delete it from the array
        });
    }
    else if ('goOnl' == data) {
        console.log("sending to serial: reset: " + reset);
        myPort.write(reset);
        console.log("sending to serial: grab:" + grabControl);
        myPort.write(grabControl);
        count = 1;
        myPort.write(alive);
        //cmd_alive();
        checkData();
        //checkUnit(195);
    }
    else if ('alloc' == data) {
        if (alive_flag) {
            var message = new Buffer("", 'hex');
            message = alloca;
            message[2] = src[0];
            //console.log('Sending to port'+ message);
            console.log('Allocating Mike');
            console.log(message);
            myPort.write(message);
        }
        else {
            console.log('System offline')
        }
    }
    else if ('deall' == data) {
        var message = new Buffer("", 'hex');
        message = dealloca;
        message[2] = src[0];
        //console.log(message);
        //console.log('Sending to port' + message.toString());
        console.log('DeAllocating Mike');
        myPort.write(message);
    }
}


function cmd_alive() {
    setTimeout(function () {
        myPort.write(alive);
        alive_flag = true;
        if (onlineFlag) {
            myPort.write(cmdLogin);
            onlineFlag = false;

        }
        cmd_alive();
    }, 1000);

}
function checkData() {

    setTimeout(function () {
        if (!rx_data) {
            if (count <= 5) {
                console.log("sending to serial: grab:" + grabControl);
                myPort.write(grabControl);
                count++;
                checkData();
            }
        }
        else {
            if (onlineFlag) {
                console.log('Requesting Ring Status');
                myPort.write(reqRing);
              //  console.log('Broadcast');
                //myPort.write(cmdLogin);

                onlineFlag = false;
            }
            cmd_alive();
        }
    }, 1000);
}
function checkDelegates(data) {
    console.log('checking Delegates');
    sendToBrowser(data.toString());
    console.log(data);
    //sendToBrowser(data);
    //console.log('sending data from out:' + data.toString('hex'));

}

function checkUnit(add) {
    //console.log('Checking Unit');
    //console.log(add);
    add++;
    var message = new Buffer("", 'hex');
    message = cmdLogin;
    //while(i<=nU ) {
    message[2] = new Buffer(add.toString(16), 'hex')[0];
    //console.log(message);
    //console.log('Sending to port' + add.toString(16) + 'Message follows');
    myPort.write(message);

    //}
}


