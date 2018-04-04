var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, { wsEngine: 'ws' });

var acroGame = require('./acro-game');

users = [];
connections = [];

var game = new acroGame(connections);
var i = 0;

server.listen(process.env.PORT || 3000);
console.log('Server running...');


const clientPath = `${__dirname}`;

app.use(express.static(clientPath));
app.use(express.static('public'));


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    
    //disconnected
    socket.on('disconnect', function(data){
        //remove from online users
        users.splice(users.indexOf(socket.username),1);
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
        updateUsernames();
        game.removeUser(socket);
    });

    //Send Message
    socket.on('send message', function(data){
        console.log(data);
        //io.sockets.emit('new message', {msg: data, user: socket.username});
        socket.broadcast.emit('new message', {msg: data, user: socket.username});
        socket.emit('new message', {msg: data, user: "me"});
    });

    //New User
    socket.on('new user', function(data, callback){
        
        if (users.indexOf(data) > -1) {
            callback(false);
        }else{
            connections.push(socket);
            console.log('connected: %s sockets connected', connections.length);
            callback(true);
            socket.username = data;
            socket.idx=i;
            i++;
            users.push(socket.username);
            game.addUser(socket, connections.indexOf(socket));
            updateUsernames();
        } 
        
    });

   
    function updateUsernames(){       
        io.sockets.emit('get users', users);
       // game.updateUsernames(connections);
        if(connections.length > 1 && !game.isRunning()){
            console.log(connections.length);
            game.gameStart();
        }else if (connections.length == 1 ){
            game.gameEnd();
        }
    }
});
