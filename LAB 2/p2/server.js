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

const { strictEqual } = require('assert');
//import world
var world = require('./world.js');
var WORLD = world.WORLD;

//var last_id = 0; //provisional --> change to json file etc..

//create world
WORLD.fromJSON();

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
    if(msg.type == "user_update"){
        user.fromJSON(msg.user);
    }
   if(msg.type == "text"){
        console.log(msg);
        sendMessageRoom(user,msg);
    }
    //TESTING
    if(msg.type == "change_room"){ //type:"change_room",room_id:(nueva room)
        console.log(msg);
        changeRoom(user,msg);
    }
}
//TESTING
function changeRoom(user,msg){

    if(user.room_id != msg.room_id){

        var old_room = WORLD.rooms[user.room_id];
        var new_room =  WORLD.rooms[msg.room_id];

        if(old_room && new_room){

            old_room.leaveUser(user);

            new_room.enterUser(user);

            var msg = { type: "room", room: new_room.toJSON()};
            user._connection.send(JSON.stringify(msg));
        }
    }
}

function sendMessageRoom(my_user, msg ){
    var room = WORLD.rooms[my_user.room_id];
    for(var i=0; i < room.room_users.length; i++){
        var user_id = room.room_users[i];
        if(my_user.id != user_id){
            var user = WORLD.users_by_id[user_id];
            if(user._connection){
                user._connection.send(JSON.stringify(msg));
            }
        }
    }
}

function createUser(user,msg){
    var new_user = true;
    var file_data = readFileJSON();
    if(file_data){
        for(var i = 0; i<file_data.length;i++){
            if(msg.name == file_data[i].name && msg.password == file_data[i].password){
                new_user = false;
                var {password, ...loaded_user} = file_data[i];
                user.fromJSON(loaded_user);
                //por si quiere canviar avatar
                user.avatar_id = msg.avatar_id;
                console.log("LOADED USER WITH ID "+file_data[i].id);
            }
        }
        if(new_user){
            user.id = file_data.length +1;
            user.name = msg.name;
            user.avatar_id = msg.avatar_id;
            user.password = msg.password;
            user.room_id = 0; //default on room 0
            var {_connection, ...stored_user} = user;
            file_data.push(stored_user);
            console.log(stored_user);
            fs.writeFile(users_json, JSON.stringify(file_data,null,2 ) , err => {
                if (err) {
                    console.log('Error writing file', err)
                }
            });

            console.log("NEW WEBSOCKET USER WITH ID "+ user.id);
        }
    }
    //check if it is already connected
    var connected = WORLD.users_by_id[user.id];
    if(connected){
        user.id = -1;
        var msg = { type: "connection_error", data: "User is already connected!"}
        user._connection.send(JSON.stringify(msg));
        
    }else{
        WORLD.users.push(user);
        WORLD.users_by_id[user.id] = user;
        var room = WORLD.rooms[user.room_id]; 
        room.enterUser(user);


        if(user._connection){
            var msg = { type: "login", user: user.toJSON()};
            user._connection.send(JSON.stringify(msg));

            var msg = { type: "room", room: room.toJSON()};
            user._connection.send(JSON.stringify(msg));

            var msg = {type:"users", room_id: room.id, users: room.getRoomUsers()};
            for (var i = 0; i < WORLD.users.length; i++)
            {
                msg.users[i].position = msg.users[i].target_position;
                
            }
            console.log(JSON.stringify(msg));
            user._connection.send(JSON.stringify(msg));
        }
    }
}

function onUserDisconnected(user){
    var index = WORLD.users.map(function(e) { return e.id; }).indexOf(user.id);
    if(index != -1 ){
        WORLD.users.splice(index,1);
        delete WORLD.users_by_id[user.id];
    }
    console.log("USER "+user.id+" IS GONE!");
    var room = WORLD.rooms[user.room_id];
    if(room){
        room.leaveUser(user);
    } 
    //update user on JSON
    var file_data = readFileJSON();
    if(file_data){
        for(var i = 0; i<file_data.length;i++){
            if(file_data[i].id == user.id ){  
              //variable fields (un poco hardcoded...) quizas mejor metiendole el user entero
              file_data[i].position = user.position;
              file_data[i].target_position = user.target_position;
              file_data[i].room_id = user.room_id;
              file_data[i].facing = user.facing;
            }
          }
        fs.writeFile(users_json, JSON.stringify(file_data,null,2 ) , err => {
            if (err) {
                console.log('Error writing file', err)
            }
        });
    }
}

function readFileJSON(){
    try {
        var data = fs.readFileSync(users_json, 'utf8')
        return JSON.parse(data);
      } catch (err) {
        console.error(err)
        return null;
      }
}

function Tick(){

    for(var i in WORLD.rooms){

        var room = WORLD.rooms[i];
        var users_info = room.getRoomUsers();
        //Send data to users on the room
        for(var j = 0; j< room.room_users.length; j++){

            var user_id = room.room_users[j];
            var user = WORLD.users_by_id[user_id];
            if(user && user._connection){
                var msg = {
                    type:"users", 
                    room_id:room.id,
                    users: users_info
                }
                user._connection.send (JSON.stringify(msg));
            }
            
        }
    }
}
setInterval(Tick, 1000);