//Import libraries

const http = require('http'),
      WebSocketServer = require('websocket').server,
      url = require('url'),
      fs = require('fs');

require('dotenv').config();

//FIREBASE

const { initializeApp, applicationDefault} = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp({
    credential: applicationDefault(),
})

const db = getFirestore();

async function getAllUsers(request,response) {
    const querySnapshot = await db.collection('users').get()
    const users = querySnapshot.docs.map (doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    response.writeHead(200, { "Content-Type": "application/json" })
    response.write(JSON.stringify(users))
    response.end()
}

async function updateUser() {

    const name = test,
          password = 123;

   // await db.collection('users').update(req.body);
}

async function bodyParser(request) {
    return new Promise((resolve, reject) => {
      let totalChunked = ""
      request
        .on("error", err => {
          console.error(err)
          reject()
        })
        .on("data", chunk => {
          totalChunked += chunk
        })
        .on("end", () => {
          request.body = JSON.parse(totalChunked)
          resolve()
        })
    })
  }

  async function login(request,response) {
    try {
        await bodyParser(request)
        

        //login function

        response.writeHead(200, { "Content-Type": "application/json" })
        response.write(JSON.stringify(request.body))
        response.end()
      } catch (err) {
        response.writeHead(400, { "Content-type": "text/plain" })
        response.write("Invalid body data was provided", err.message)
        response.end()
      }
    }

    async function register(request,response) {
        try {
            await bodyParser(request)
            
            //register function 
            const {name, password} = request.body
    

            await db.collection('users').add({
                name,
                password,
            });
            
            response.writeHead(200, { "Content-Type": "application/json" })
            response.write(JSON.stringify(request.body))
            response.end()
          } catch (err) {
            response.writeHead(400, { "Content-type": "text/plain" })
            response.write("Invalid body data was provided", err.message)
            response.end()
          }
        }

//Global consts

const port = 9026;
const second_port = 9027;

//HTTP Server
const server = http.createServer(async(request, response) => {
    let url = request.url
    let method = request.method
  
    switch (method) {
        case "POST":
            if (url === "/login") {
              login(request,response);
            }
            if (url === "/register") {
                register(request,response);
            }
            break
      
          case "GET":
            if (url === "/") {
                getAllUsers(request,response);
            }
            break
      
          case "PUT": //actualizar cuando salga de la app?
            break

      
          default:
            response.writeHead(400, { "Content-type": "text/plain" })
            response.write("Invalid URL")
            response.end()
    }
  })



server.listen(port, function(){
    console.log('Server is listening on ' + port);
});


/* 
// Websocket Server

wsServer = new WebSocketServer({ // create the server
    httpServer: server //if we already have our HTTPServer in server variable...
});

const { strictEqual } = require('assert');
//import world
var world = require('./world.js');
var WORLD = world.WORLD;

//create world
WORLD.fromJSON();

//WebSocket core 
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

//Function that selects the msg type and perform an action according to it
function onUserMessage(user,message){
    var msg = JSON.parse(message.utf8Data);
    
    if(msg.type == "login"){
        createUser(user,msg);
    }
    if(msg.type == "user_update"){
        user.fromJSON(msg.user);
    }
   if(msg.type == "text"){
       console.log(JSON.stringify(msg));
        sendMessageRoom(user,msg);
    }
    if(msg.type == "change_room"){ 
        changeRoom(user,msg);
    }
    if(msg.type == "change_object"){
        changeObject(user,msg);
    }
}
//Function to change the state of an object
function changeObject(user,msg){

    var object = msg.object;

    if(object.type == "door"){
        var old_room = WORLD.rooms[object.from_room];
        var new_room = WORLD.rooms[object.target_room];

        travelSprites(object, old_room.sprites, "img/door_open.png");
        travelSprites(object, new_room.sprites, "img/door_open.png");

        var msg1 = { type: "change_object", room: old_room.toJSON()};
        var msg2 = { type: "change_object", room: new_room.toJSON()};

        for(var i=0; i < old_room.room_users.length; i++){
            var user_id = old_room.room_users[i];
            var user = WORLD.users_by_id[user_id];
            user._connection.send(JSON.stringify(msg1));
        }
        for(var i=0; i < new_room.room_users.length; i++){
            var user_id = new_room.room_users[i];
            var user = WORLD.users_by_id[user_id];
            user._connection.send(JSON.stringify(msg2));
        }


    }
    if(object.type == "lampara"){
        var room = WORLD.rooms[user.room_id];
        travelSprites(object, room.sprites, "img/lampara_on.png", true, "img/lampara.png");

        var msg = { type: "change_object", room: room.toJSON()};

        for(var i=0; i < room.room_users.length; i++){
            var user_id = room.room_users[i];
            var user = WORLD.users_by_id[user_id];
            user._connection.send(JSON.stringify(msg));
        }
    }   
}

//Helper function to travel all the sprites of one room
function travelSprites(object, room_sprites, src,onof,src2){
    for(var i = 0; i < room_sprites.length; i++){
        if(room_sprites[i].type == object.type){
            if(room_sprites[i].id == object.id){
                if(!room_sprites[i].state){
                    room_sprites[i].src = src;
                    room_sprites[i].state = true;
                }
                else if(onof && room_sprites[i].state){
                    room_sprites[i].src = src2;
                    room_sprites[i].state = false;
                }
            }
        }
    }
}
//Function to change the room of the user
function changeRoom(user,msg){

    if(user.room_id != msg.room_id){

        var old_room = WORLD.rooms[user.room_id];
        var new_room =  WORLD.rooms[msg.room_id];
        console.log("USER "+user.id+" CHANGE FROM ROOM "+old_room.id+" TO ROOM "+new_room.id);
        if(old_room && new_room){
            //remove user from old room
            old_room.leaveUser(user);
            //add user to the new room
            new_room.enterUser(user);
            //update server
            var index = WORLD.users.map(function(e) { return e.id; }).indexOf(user.id);
            WORLD.users[index].fromJSON(user);
            WORLD.users_by_id[user.id] = user;
            //send new room
            var msg = { type: "room", room: new_room.toJSON()};
            user._connection.send(JSON.stringify(msg)); 
            var msg = {type:"users", room_id: new_room.id, users: new_room.getRoomUsers()};

            for (var i = 0; i < new_room.room_users.length; i++)
            {
                msg.users[i].position = msg.users[i].target_position;
            }
            
            user._connection.send(JSON.stringify(msg));
        }
    }
}
//Function to send text to the other users of the room, we decided to define 800px min distance to receive the message
function sendMessageRoom(my_user, msg ){
    var room = WORLD.rooms[my_user.room_id];
    for(var i=0; i < room.room_users.length; i++){
        var user_id = room.room_users[i];
        var user = WORLD.users_by_id[user_id];
        var distance = Math.abs(my_user.target_position[0] - user.target_position[0] );
        if(my_user.id != user_id  && distance < 300){
            if(user._connection){
                user._connection.send(JSON.stringify(msg));
            }
        }
    }
}
//Function to create the user 
//case 1:  the user already exist by username-password key values on the json file and values are sent to the client
//case 2: the user is new, we add the new register on the file and send the "default" values to the client
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
            }
            
            user._connection.send(JSON.stringify(msg));
        }
    }
}

//Function on user disconnected
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
              //variable fields 
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

//Helper function to read json files
function readFileJSON(){
    try {
        var data = fs.readFileSync(users_json, 'utf8')
        return JSON.parse(data);
      } catch (err) {
        console.error(err)
        return null;
      }
}

//Send tick to all the rooms to close the doors every 10 seconds
function doorTick(){
    for(var i in WORLD.rooms){
          var room = WORLD.rooms[i];
          for(var j = 0; j < room.sprites.length; j++){
                if(room.sprites[j].type == "door"){
                    if(room.sprites[j].state){
                        room.sprites[j].src = "img/door_close.png";
                        room.sprites[j].state = false;
                    }
                }
            }
            for(var j = 0; j< room.room_users.length; j++){
                var user_id = room.room_users[j];
                var user = WORLD.users_by_id[user_id];
                var msg = { type: "change_object", room: room.toJSON()};
                user._connection.send(JSON.stringify(msg));
            }
    }
}

setInterval(doorTick, 10000);

//Send tick to the room state to every user every second
function Tick(){

    for(var i in WORLD.rooms){

        var room = WORLD.rooms[i];
        var users_info = room.getRoomUsers();
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

setInterval(Tick, 1000);*/