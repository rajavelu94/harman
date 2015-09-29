var serialport = require('serialport');
var SerialPort = serialport.SerialPort;


// get port name from the command line:
portName = process.argv[2];

var myPort = new SerialPort(portName, {
    baudRate: 9600,
    // look for return and newline at the end of each data packet:
    parser: serialport.parsers.readline("\n")
});

function showPortOpen() {
    console.log('port open. Data rate: ' + myPort.options.baudRate);
    sendSerialData();
}

function sendSerialData(data) {
    console.log(data);
    myPort.write("Hello");
    showPortClose();
}

function showPortClose() {
    console.log('port closed.');
}

function showError(error) {
    console.log('Serial port error: ' + error);
}

var data = 'Hello there';
myPort.on('open', showPortOpen);
myPort.on('data', sendSerialData);
myPort.on('close', showPortClose);
myPort.on('error', showError);

