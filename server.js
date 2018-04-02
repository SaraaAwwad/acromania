var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var acroGame = require('./acro-game');

users = [];
connections = [];

var game = new acroGame(connections);

server.listen(process.env.PORT || 3000);
console.log('Server running...');

app.use(express.static('public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    
    console.log('connected: %s sockets connected', connections.length);

    //disconnected
    socket.on('disconnect', function(data){
        //remove from online users
        users.splice(users.indexOf(socket.username),1);
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
        updateUsernames();
    });

    //Send Message
    socket.on('send message', function(data){
        console.log(data);
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    //Send Whisper
/*    socket.on('send whisper', function(data){
        console.log("whisper"+data);
        //whisper user sent game or vote..
        game.userTurn(socket, data);
        socket.emit('new whisper', {msg: data, user: socket.username});
    });
*/
    //New User
    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });

   
    function updateUsernames(){
        io.sockets.emit('get users', users);
        game.updateUsernames(connections);
        if(connections.length > 1 && !game.isRunning()){
            game.gameStart();
        }else if (connections.length == 1 ){
            game.gameEnd();
        }
    }
});
