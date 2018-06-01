var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var os = require('os');
var ifaces = os.networkInterfaces();
var PORT = process.env.PORT || 3000;
var QRCode = require('qrcode');
var qrurl,ipad;
app.use(express.static(__dirname + '/public'));

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
            // console.log(ifname + ':' + alias, iface.address);
            ipad = iface.address;
            QRCode.toDataURL(ipad, function (err, url) {
                qrurl = url;
              })
          } else {
            // this interface has only one ipv4 adress
            // console.log(ifname, iface.address);
            ipad = iface.address;
            QRCode.toDataURL(ipad, function (err, url) {
                qrurl = url;
              })
          }
          ++alias;
        });
      });
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
    console.log('A user connected');
    socket.emit('qr',{qrd: qrurl , ipd: ipad});
    // socket.on('message',function(data){
    //     console.log(data);
    //     io.sockets.emit('pass',data);
    // });

    socket.on('verify',function(data){
        console.log(ipad, data);

        if(ipad == data){
            var mdata = "'"+data+"'";
            console.log(mdata,"true");
            socket.emit('mdata',"true");
            socket.on('message',function(data){
                console.log(data);
                socket.emit('pass',data);
            });
        }    
    });



    socket.on('disconnect',function(){
        console.log('A user Disconnected');
    });
});

http.listen(PORT, function(){
    console.log('listening on *:3000');
});