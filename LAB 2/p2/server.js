// importamos las librerías requeridas

const http = require('http'),
      WebSocketServer = require('websocket').server,
      url = require('url'),
      express = require('express');


//vars y const globales

const port = 9026;
const second_port = 9027;

var clients = [ ];
var db = {};
var last_id = 1;
var MAX_BUFFER = 100;

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
    var login = false;
      
    var client = {
        user_id: "",
        username: "",
        password: ""
    }; 
    console.log("User in login");
    //initialize
    client.user_id = last_id;
    last_id++;

    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            // first message sent by user is their login
            
             if (login === false) {
                var msg = JSON.parse(message.utf8Data);
                if (msg.type == "login"){
                    client.username = msg.username;
                    client.password = msg.password;
                    
                    console.log( "NEW USER \n" + "user_id: " + client.user_id + " , username : " + client.username + " , password : " + client.password);
                    connection.sendUTF("welcome!");
                    clients.push(connection);
                    login = true;
                }
                
              } else { // log and broadcast the message
                
                var msg = JSON.parse(message.utf8Data);
		            console.log( "NEW MSG FROM USER " + msg.username + " : " + msg.content ); // process WebSocket message
                var send = JSON.stringify(msg)
                for (let i = 0; i < clients.length; i++) {
                  clients[i].sendUTF(send);
                }
                
              }
            }
    });

    connection.on('close', function(connection) {
        if (login !== false ) {

          console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
          
          login = true;
          for( var i = 0; i < clients.length; i++){ 
    
            if ( clients[i].user_id == client.user_id) { 
        
                clients.splice(i, 1); 
            }
        
        }
          clients.splice


          // remove user from the list of connected clients
          //clients.splice(index, 1);
        }
      });
});


















