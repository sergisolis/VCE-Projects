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

var clients = [ ];
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

//helper function to read json
function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

//helper function to create position message
function positionMessage(id, position, username){
  var message = {
    type:"position",
    id: id,
    username: username,
    position_x: position
  }
  return message;
}

//helper function to send message to all other users of the same room
function sendMessageToRoom(client,msg){
  for (let i = 0; i < clients.length; i++) {
    if(clients[i].id != client.id && clients[i].room_id == client.room_id){
      clients[i].connection.sendUTF(JSON.stringify(msg));
    }
  }
}
//helper function to collect positions of the other users and send my position (used on login and change_room)
function collectPositionsOfRoom(client){
  //Array of other users position
  var clients_pos = {
    id: client.id,
    type:"position_history",
    content:[]
  };

  //Send my position to all other users of the room
  var my_position = positionMessage(client.id,client.pos_x,client.username);
  for (let i = 0; i < clients.length; i++) {
    if(clients[i].id != client.id && clients[i].room_id == client.room_id){
      //Get position of all other users of the room
      var client_pos = positionMessage(clients[i].id, clients[i].pos_x, clients[i].username);
      clients_pos.content.push(client_pos);
      //send message to other users of my position
      clients[i].connection.sendUTF(JSON.stringify(my_position));  
    }
  }
  //send message with all other users position
  client.connection.sendUTF(JSON.stringify(clients_pos));
}

//Helper function to fill the client with the data
function fillClient(client,id,room_id,pos_x,avatar_id){
  client.id = id;
  client.room_id = room_id;
  client.pos_x = pos_x;
  client.avatar_id = avatar_id;
}


wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
      }

    var connection = request.accept(null, request.origin);
    var login  = false;
 
    var client = {
        id: null,
        username: "",
        password: "",
        room_id: null,
        pos_x: null,
        avatar_id: null,
        connection : connection
    }; 
    console.log("User in login");

    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            // first message sent by user is their login
                var msg = JSON.parse(message.utf8Data);
                if (msg.type == "login"){

                    client.username = msg.username;
                    client.password = msg.password;
                    //read json file, if user/pass exists load the last user data, if not, create the new user register with default values
                    var new_user = true;
                    jsonReader(users_json, (err, users) => {
                      if (err) {
                        console.log(err);
                        return;
                      }
                      //if user exists, load the last user data from the json file
                      for(var i = 0; i<users.length;i++){
                        if(users[i].username == client.username && users[i].password == client.password){
                          new_user = false;
                          fillClient(client,users[i].id, users[i].room_id, users[i].pos_x, msg.avatar_id);
                          console.log( "LOADED USER  \n" + "id: " + client.id + " , username : " + client.username + " , password : " + client.password);  
                        }
                      }
                      //if user not exist, create the new user register with default values
                      if(new_user == true){
                        fillClient(users.length + 1, 1, 0, msg.avatar_id) //default values room_id:1 and pos_x:0
                        var {avatar_id,connection, ...user} = client
                        console.log( "NEW USER \n" + "id: " + client.id + " , username : " + client.username + " , password : " + client.password);     
                        users.push(user);
                        fs.writeFile(users_json, JSON.stringify(users,null,2 ) , err => {
                          if (err) {
                              console.log('Error writing file', err)
                          }
                      });
                      }
                      //CALENTADITA
                      //push new client into clients list
                    clients.push(client);
                    login = true;
                    collectPositionsOfRoom(client);
                    });
                }else if (msg.type == "text" ){ // log and broadcast the message  
                //var msg = JSON.parse(message.utf8Data);
               // msg.id =  client.id;
		            console.log( msg); // process WebSocket message
                sendMessageToRoom(client,msg);

             }else if (msg.type == "position"){
               //upload to new position
               client.pos_x = msg.pos_x;
               var my_position = positionMessage(client.id,client.pos_x,client.username);
               //Send new position to all other users of the room
               sendMessageToRoom(client,my_position);

             }else if(msg.type == "change_room"){
              //upload to new room/position
              client.pos_x = msg.pos_x;
              client.room_id = msg.room_id;
              collectPositionsOfRoom(client);
             }
         }
    });
    //User disconnected
    connection.on('close', function(connection) {
        if (login !== false ) {

          console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
          
          login = true;
          for( var i = 0; i < clients.length; i++){ 
    
            if ( clients[i].id == client.id) { 
        
                clients.splice(i, 1); 
            }
        
        }


          // remove user from the list of connected clients
          //clients.splice(index, 1);
        }
      });
});


















