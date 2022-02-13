// importamos las librerías requeridas

const http = require('http'),
      WebSocketServer = require('websocket').server,
      url = require('url'),
      fs = require('fs'),
      users_json = "./users.json";

//vars y const globales

const port = 9026;
const second_port = 9027;

//HTTP Server

const server = http.createServer( function(request, response) {
	console.log("REQUEST: " + request.url );
	var url_info = url.parse( request.url, true ); //all the request info is here
	var pathname = url_info.pathname; //the address
	var params = url_info.query; //the parameters
	response.end("OK!"); //send a response
});

server.listen(port, function(){
    console.log('Server is listening on ' + port);
});

// Websocket Server

wsServer = new WebSocketServer({ // create the server
    httpServer: server //if we already have our HTTPServer in server variable...
});

//import world
var world = require('./world.js');
var WORLD = world.WORLD;

var last_id = 0; //provisional --> change to json file etc..

//create world
WORLD.fromJSON();
console.log("ROOMS: " + WORLD.rooms.length);

wsServer.on('request', function(request) {

    var connection = request.accept(null,request.origin);

    var user = new world.User();
    user._connection = connection;

    connection.on('message',function (message){
       onUserMessage(user,message);
    });

    connection.on('close',function(connection){
        onUserDisconnected(user);
    });

});

//FUNCTIONS
function onUserMessage(user,message){
    var msg = JSON.parse(message.utf8Data);
    if(msg.type == "login"){
        createUser(user,msg);
    }
    /*if(msg.type == "user_update"){
        user.fromJSON(msg.user);
    }*/
   if(message.type == "text"){
        sendMessageRoom(message.utf8Data);
    }
}

function sendMessageRoom( msg ){
    var room = WORLD.rooms[user.room_id];
    for(var i=0; i < room.room_users.length; i++){
        var user_id = room.room_users[i];
        var user = WORLD.users_by_id[user_id];
        if(user._connection){
            user._connection.send(msg);
        }
    }
}

function createUser(user,msg){

    user.id = last_id ++;
    user.name = msg.name;
    user.avatar_id = msg.avatar_id;
    WORLD.users.push(user);
    WORLD.users_by_id[user.id] = user;
    var room = WORLD.rooms[0]; //default on room 0
    room.enterUser(user);

    console.log("NEW WEBSOCKET USER!");

    if(user._connection){
        var msg = { type: "login", user: user.toJSON()};
        console.log(msg);
        user._connection.send(JSON.stringify(msg));

        var msg = { type: "room", room: room.toJSON()};
        console.log(msg);
        user._connection.send(JSON.stringify(msg));

        var msg = {type:"users", room_id: room.id, users: room.getRoomUsers()};
        console.log(msg);
        user._connection.send(JSON.stringify(msg));
    }
}

function onUserDisconnected(user){
    var index = WORLD.users.indexOf(this);
    if(index != -1 ){
        WORLD.users.splice(index,1);
        delete WORLD.users_by_id[user.id];
    }
    console.log("USER "+user.id+" IS GONE!");
    var room = WORLD.rooms[user.room_id];
    if(room){
        room.leaveUser(user);
    } 
}