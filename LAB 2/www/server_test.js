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

var world = require('./world.js');
var WORLD = world.WORLD;

var last_id = 0;

//create world
WORLD.fromJSON();
console.log("ROOMS: " + WORLD.rooms.length);

var fake_user = createUser(null);
fake_user.name = "tobias";

wsServer.on('request', function(request) {

    var connection = request.accept(null,request.origin);

    var user = createUser(connection);

    connection.on('message',function (message){
       onUserMessage(user,message);
    });

    connection.on('close',function(connection){
        onUserDisconnected(user);
    });

});

function sendMessage( msg ){
    for(var i=0; i < WORLD.users.length; i++){
        var user = WORLD.users[i];
        if(user._connection){
            user._connection.send(msg);
        }
    }
}

function onUserMessage(user,message){
    var msg = JSON.parse(message.utf8Data);
    if(msg.type == "user_update"){
        user.fromJSON(msg.user);
    }
   /* if(message.type === 'utf8'){
        console.log("NEW MSG: "+message.utf8Data); //process websocket message
        sendMessage(message.utf8Data);
    }*/
}

function createUser(connection){

    var user = new world.User();
    user._connection = connection;
    user.id = last_id ++;
    WORLD.users.push(user);
    WORLD.users_by_id[user.id] = user;
    var room = WORLD.rooms[0];
    room.enterUser(user);

    console.log("NEW WEBSOCKET USER!");

    if(connection){
        var msg = { type: "login", user: user.toJSON()};
        connection.send(JSON.stringify(msg));

        var msg = { type: "room", room: room.toJSON()};
        connection.send(JSON.stringify(msg));

        var msg = {type:"users", room_id: room.id, users: room.getRoomUsers()};
        connection.send(JSON.stringify(msg));
    }
    return user;
}
function onUserDisconnected(user){
    var index = WORLD.users.indexOf(this);
        if(index != -1){
            WORLD.users.splice(index,1);
            delete WORLD.users_by_id[user.id];
        }
        console.log("USER IS GONE!");
        var room = WORLD.rooms[user.id];
        if(room){
            room.leaveUser(user);
        } else{
            console.log("NO ESTABA!");
        }     
}

function Tick(){

    fake_user.position[0] += Math.random()*10-5;
    fake_user.facing = Math.random() > 0.5 ? world.FACE_LEFT : world.FACE_RIGHT;
    for(var i in WORLD.rooms){

        var room = WORLD.rooms[i];
        var users_info = room.getRoomUsers();
        //Send data to users on the room
        for(var j = 0; j< room.users.length; j++){

            var user_id = room.users[j];
            var user = WORLD.users_by_id[user_id];
            if(user && user._connection){
                var msg = {
                    type:"users", 
                    room_id:room.id,
                    users: users_info
                }
                WORLD.users._connection.send (JSON.stringify(msg));
            }
            
        }
    }
}
setInterval(Tick, 1000);