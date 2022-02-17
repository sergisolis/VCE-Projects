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
    console.log(JSON.stringify(msg));
    if(msg.type == "login"){
        createUser(user,msg);
    }
    if(msg.type == "user_update"){
        user.fromJSON(msg.user);
    }
   if(msg.type == "text"){
        sendMessageRoom(user,msg);
    }
    //TESTING
    if(msg.type == "change_room"){ //type:"change_room",room_id:(nueva room)
        changeRoom(user,msg);
    }
    if(msg.type == "change_object"){
        changeObject(user,msg);
    }
}
//TESTING
function changeObject(user,msg){

    var room = WORLD.rooms[user.room_id];
    var type = msg.object.type;

    for(var i = 0; i < room.sprites.length; i++){
 

    }
    
}
function changeRoom(user,msg){

    if(user.room_id != msg.room_id){

        var old_room = WORLD.rooms[user.room_id];
        var new_room =  WORLD.rooms[msg.room_id];

        if(old_room && new_room){
            //actualizar puertas tanto en old como new
           for(var i = 0; i < old_room.sprites.length; i++){
               if(old_room.sprites[i].type == "door"){
                   if(old_room.sprites[i].target_room == msg.room_id && old_room.sprites[i].state == false){
                        old_room.sprites[i].src = "img/door_open.png";
                        old_room.sprites[i].state = true;
                   }
               }
           }
           var new_position = 0;
           for(var i = 0; i < new_room.sprites.length; i++){
                if(new_room.sprites[i].type == "door"){
                    if(new_room.sprites[i].target_room == user.room_id && new_room.sprites[i].state == false){
                        new_room.sprites[i].src = "img/door_open.png";
                        new_room.sprites[i].state = true;
                        new_position = new_room.sprites[i].x;
                    }
                }
            }

            //saca usuario de la sala antigua
            old_room.leaveUser(user);
            //mete usuario sala nueva
            new_room.enterUser(user);
            //update server
            var index = WORLD.users.map(function(e) { return e.id; }).indexOf(user.id);
            WORLD.users[index].fromJSON(user);
            WORLD.users_by_id[user.id] = user;
            //envia la nueva room
            var msg = { type: "room", room: new_room.toJSON()};
            user._connection.send(JSON.stringify(msg)); //HACE FALTA ENVIARLO A TODOS EN UN NUEVO TIPO DE MENSAJES QUE SOLO TE PASE LAS PUERTAS A TODOS
            
            var msg = {type:"users", room_id: new_room.id, users: new_room.getRoomUsers()};

            for (var i = 0; i < new_room.room_users.length; i++)
            {
                msg.users[i].position = msg.users[i].target_position;

                /*
                if (msg.users[i].target_position != undefined){
                    
                }else{
                    msg.users[i].position = [0,0];
                }
                */
                
            }
            
            user._connection.send(JSON.stringify(msg));
        }
    }
}

function sendMessageRoom(my_user, msg ){
    var room = WORLD.rooms[my_user.room_id];
    for(var i=0; i < room.room_users.length; i++){
        var user_id = room.room_users[i];
        var user = WORLD.users_by_id[user_id];
        var distance = Math.abs(my_user.target_position[0] - user.target_position[0] );//comprovar distancias despues
        if(my_user.id != user_id){
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
            
            for (var i = 0; i < room.room_users.length; i++)
            {
                msg.users[i].position = msg.users[i].target_position;

                /*
                if (msg.users[i].target_position != undefined){
                    
                }else{
                    msg.users[i].position = [0,0];
                }
                */
                
            }
            
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

/*function doorTick(){
    for(var i in WORLD.rooms){
          var room = WORLD.rooms[i];
          var doors = room.sprites.doors;
          for(var j in doors){
              if(doors[j].src = "img/door_opened"){
                  doors[j],src = "img/door_closed";
              }
          }
    }
}

setInterval(doorTick(), 1000);*/

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

//test
function WorldTick(){
    console.log("USERS: "+JSON.stringify(WORLD.users));
}
setInterval(WorldTick,5000);
setInterval(Tick, 1000);