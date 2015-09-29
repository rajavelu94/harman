var SerialPort = require("serialport").SerialPort;

var sp = new SerialPort("COM1", {
  baudrate: 115200
});
var rx_data = false;

sp.on('open',function() {
  sp.on('data', function(data) {
      console.log('>>>>>', data);
      console.log(rx_data)
      rx_data = true;
      console.log(rx_data)
  });

  //var message = new Buffer(0x0a,0x00,0x00,0x00,0xd0,0x00,0x0d);
  var message = new Buffer("542356", 'hex');
  console.log(message);
  function writeThenDrainThenWait(duration) {
    console.log('Calling write...');
    sp.write(message, function() {
      console.log('...Write callback returned...');
      // At this point, data may still be buffered and not sent out from the port yet (write function returns asynchrounously).
      console.log('...Calling drain...');
      sp.drain(function() {
        // Now data has "left the pipe" (tcdrain[1]/FlushFileBuffers[2] finished blocking).
        // [1] http://linux.die.net/man/3/tcdrain
        // [2] http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx
        console.log('...Drain callback returned...');
        console.log('...Waiting', duration, 'milliseconds...');
        setInterval(writeThenDrainThenWait, duration);
      });
    });
  };

  function writeThenWait(duration) {
    console.log('Calling write...');
    sp.write(message, function() {
      console.log('...Write callback returned...'); // Write function call immediately returned (asynchrounous).
      console.log('...Waiting', duration, 'milliseconds...');
      // Even though write returned, the data may still be in the pipe, and hasn't reached your robot yet.
      setTimeout(checkData () , duration);
    });
  };

  function checkData() {
      setTimeout(function () {
          if (!rx_data) {
              sp.write(message);
              checkData();
          }
          else {

          }
      }, 1000);
  }


  // Stuff starts happening here
 // writeThenDrainThenWait(1000);
  writeThenWait(1000);

});
