// importamos las librerías requeridas

//const express = require('express');

const http = require('http');
const WebSocket = require('websocket');
const url = require('url');

const port = 9026;
const second_port = 9027;

var db = [ ];

var clients = [ ];

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
})

// Websocket Server

var WebSocketServer = require('websocket').server;

wsServer = new WebSocketServer({ // create the server
    httpServer: server //if we already have our HTTPServer in server variable...
});

function originIsAllowed(origin) {
    if(origin === "https://ecv-etic.upf.edu"){
        return true;
    }
    return false;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
      }

    var connection = request.accept(null, request.origin);

    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;  

    console.log("NEW WEBSOCKET USER!!!");
    connection.sendUTF("welcome!");
    connection.on('message', function(message) {
        if (message.type === 'utf8') {  // accept only text
        //userName = htmlEntities(message.utf8Data);  
            var msg = JSON.parse(message.utf8Data);
		    console.log( "NEW MSG FROM USER " + msg.username + " : " + msg.content ); // process WebSocket message
        }
    });

    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
          console.log((new Date()) + " Peer "
              + connection.remoteAddress + " disconnected.");
          // remove user from the list of connected clients
          clients.splice(index, 1);
        }
      });
});


















