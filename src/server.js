const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const robot = require("robotjs");
const screenshot = require('screenshot-desktop');

const PORT = 3000;


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
 
    robot.setMouseDelay(2);
    let screenSize = robot.getScreenSize();
    let height = screenSize.height;
    let width = screenSize.width;
    console.log('w: ' + width+', h: ' + height);

    socket.emit('init', { w: width, h: height });
    
    console.log('connect client');
    

    socket.on('move', function (pos) {
        try {
            robot.moveMouse(pos.x, pos.y);
        } catch (error) {
            console.error(error);
        }
    });
    socket.on('leftclick', function(msg){
        try {
            robot.mouseToggle(msg);
        } catch (error) {
            console.error(error);
        }
    });
    socket.on('rightclick', function() {
        try {
            robot.mouseClick('right');
        } catch (error) {
            console.error(error);
        }
    });
    socket.on('key', function (msg) {
        //console.log('key: ' + msg.key + ' ' + msg.updown + ' mod:' + msg.mod);  
        if (msg.key != null && msg.updown != null){
            try {
                robot.keyToggle(msg.key, msg.updown, msg.mod);
            } catch (error) {
                console.error(error);
            }
        }   
    });


    let predataURL;
    setInterval(() => {
        screenshot().then((img) => {
            let dataURL = 'data:image/jpeg;base64,' + img.toString('base64');
            if (dataURL !== predataURL){
                io.emit('screen', dataURL);
                predataURL = dataURL;
                
                //let mouse = robot.getMousePos();
                //console.log("Mouse is at x:" + mouse.x + " y:" + mouse.y);
            }
        });
    }, 200); 

});

http.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
    console.log('http://localhost:' + PORT);
});