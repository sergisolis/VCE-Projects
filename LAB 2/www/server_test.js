// importamos las librerías requeridas

const http = require('http'),
      WebSocketServer = require('websocket').server,
      url = require('url'),
      express = require('express'),
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

var world = require('./world.js');
var WORLD = world.WORLD;

var last_index = 0;
var users = [];
var users_by_id = {};

WORLD.fromJSON();
console.log("ROOMS: " + WORLD.rooms.length);

wsServer.on('request', function(request) {

    var connection = request.accept(null,request.origin);

    var user = new world.User();
    user._connection = connection;
    user.id = last_index ++;
    users.push(connection);
    users_by_id[id] = user;
    WORLD.rooms[0].enterUser(user);

    console.log("NEW WEBSOCKET USER!");

    var msg = { type: "world", world: world.toJSON()};
    sendMessage(JSON.stringify(msg));

    var msg = { type: "login", user: user.toJSON()};
    sendMessage(JSON.stringify(msg));

    connection.on('message',function (message){
        if(message.type === 'utf-8'){
            console.log("NEW MSG: "+message.utf8Data);
            sendMessage(message.utf8Data);
        }

    });
    connection.on('close',function(connection){

    });
});
