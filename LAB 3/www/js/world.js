var FACE_RIGHT = 0;
var FACE_BOTTOM = 1;
var FACE_LEFT = 2;
var FACE_UP = 3;
//TEST
//CLASS USER
function User()
{
    this.id = -1;
    this.name = "anonymous";
    this.position = [0,0];
    this.target_position = [0,0];
    this.anim = "idle";
    this.facing = FACE_RIGHT;
    this.room_id = -1,
    this.avatar_id = -1;
}

User.prototype.fromJSON = function(json){
    this.id = json.id;
    this.name = json.name;
    if (json.position && json.id != WORLD.local_user.id){
        this.position = json.position;
    }
    this.target_position = json.target_position;
    this.anim = json.anim;
    this.facing = json.facing;
    this.room_id = json.room_id;
    this.avatar_id = json.avatar_id;

}
User.prototype.toJSON = function(){
    return {
        id : this.id,
        name : this.name,
        target_position : this.target_position.concat(),
        anim : this.anim,
        facing : this.facing,
        room_id: this.room_id,
        avatar_id: this.avatar_id
    }    
}

//CLASS ROOM
function Room()
{
    this.id = -1;
    this.sprites = [];
    this.room_users = []; //save id of the users inside room
}

Room.prototype.fromJSON = function(json){
    this.id = json.id;
    this.sprites = json.sprites.concat();
    if(json.room_users)
        this.room_users = json.room_users.concat();
}

Room.prototype.toJSON = function(){
    return {
        id: this.id,
        sprites: this.sprites.concat(),
        room_users: this.room_users.concat()
    };
}

Room.prototype.enterUser = function(user){
    this.room_users.push( user.id );
    user.room_id = this.id;
}

Room.prototype.leaveUser = function(user){
    var index = this.room_users.indexOf( user.id);
    if(index != -1){
        this.room_users.splice(index, 1);
    }  
}

Room.prototype.isUserInside = function(user){
    return this.room_users.indexOf (user.id) != -1;
}

Room.prototype.getRoomUsers = function(){
    var users_info = [];
    for(var i = 0; i< this.room_users.length; i++){

        var user_id = this.room_users[i];
        var user = WORLD.users_by_id[user_id];
        if(user){
            users_info.push(user.toJSON());  
        }     
    }
    return users_info;
}

//WORLD

//world template
var world_demo = {
    rooms : [
        {
            sprites: [
                {src:"img/background.png", x:-1344, y:0, type:"bg"},
                {src:"img/background.png", x:0, y:0 ,type:"bg"},
                {src:"img/background.png", x:1344, y:0, type:"bg"},
                {src:"img/background.png", x:2688, y:0, type:"bg"},
                {src:"img/background.png", x:-1344, y:0, type:"bg"},
                {src:"img/background.png", x:-2688, y:0, type:"bg"},
                {src:"img/door_close.png", x:50, y:250, type:"door" ,state:false, from_room:0, target_room:1, id:1},
                {src:"img/door_close.png", x:650, y:250, type:"door",state:false, from_room:0,target_room:2, id:2},
                {src:"img/door_close.png", x:1250, y:250, type:"door",state:false, from_room:0,target_room:3, id:3},
                {src:"img/lampara.png", x:350, y:250, type:"lampara", state:false, id:1},
                {src:"img/lampara.png", x:850, y:250, type:"lampara", state:false, id:2}
                //{src:"img/hall.png", x:-500, y:0}
            ]
        },
        {
            sprites: [
                {src:"img/background.png", x:0, y:0 ,type:"bg"},
                {src:"img/background.png", x:1344, y:0, type:"bg"},
                {src:"img/background.png", x:2688, y:0, type:"bg"},
                {src:"img/background.png", x:-1344, y:0, type:"bg"},
                {src:"img/background.png", x:-2688, y:0, type:"bg"},
                {src:"img/alfombra.png", x:0, y:50, type:"bg"},
                {src:"img/door_close.png", x:50, y:250, type:"door" ,state:false, from_room:1, target_room:0, id:1}        
            ]
        },
        {
            sprites: [
                {src:"img/background.png", x:0, y:0 ,type:"bg"},
                {src:"img/background.png", x:1344, y:0, type:"bg"},
                {src:"img/background.png", x:2688, y:0, type:"bg"},
                {src:"img/background.png", x:-1344, y:0, type:"bg"},
                {src:"img/background.png", x:-2688, y:0, type:"bg"},
                {src:"img/cuadro_spiderman.png", x:0, y:600, type:"bg"},
                {src:"img/door_close.png", x:650, y:250, type:"door" ,state:false, from_room:2,target_room:0, id:1}
            ]
        },
        {
            sprites: [
                {src:"img/background.png", x:0, y:0 ,type:"bg"},
                {src:"img/background.png", x:1344, y:0, type:"bg"},
                {src:"img/background.png", x:2688, y:0, type:"bg"},
                {src:"img/background.png", x:-1344, y:0, type:"bg"},
                {src:"img/background.png", x:-2688, y:0, type:"bg"},
                {src:"img/cuadro_japon.png", x:0, y:600, type:"bg"},
                {src:"img/door_close.png", x:1250, y:250, type:"door" ,state:false, from_room:3, target_room:0, id:1}
            ]
        }
    ],
};
//WORLD CLASS
var WORLD = {
    rooms: [],
    users: [],
    users_by_id: {},
    local_user: null,

    init: function()
    {
        
    },

    toJSON: function(){
        var o = {
            rooms: []
        };
        for(var i=0; i < this.rooms.length; i++){
            var room = this.rooms[i];
            room.id = i;
            o.rooms.push (room.toJSON());
        }
        return o;
    },

    fromJSON: function(json){
        
        console.log("loading world");
        if(!json)
            json = world_demo;

        for (var i = 0; i < json.rooms.length; i++){
            var room_json = json.rooms[i];
            var room = new Room();
            room.fromJSON(room_json);
            room.id = i;
            this.rooms.push(room);
        }
    },
};

//import modules
if ( typeof (module) != "undefined" ){
    module.exports = {
        User,
        Room,
        WORLD 
    }
}