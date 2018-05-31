var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var os = require('os');
var ifaces = os.networkInterfaces();

app.get('/', function(req,res){
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
      
        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
          }
      
          if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
          } else {
            // this interface has only one ipv4 adress
            console.log(ifname, iface.address);
          }
          ++alias;
        });
      });
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
    console.log('A user connected');
   
    socket.on('message',function(data){
        console.log(data);
        socket.emit('pass',data);
    });

    socket.on('disconnect',function(){
        io.sockets.emit('broadcast',{ Msg: ' Clients connected!'});
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});