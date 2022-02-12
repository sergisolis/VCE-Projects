var FACE_RIGHT = 0;
var FACE_BOTTOM = 1;
var FACE_LEFT = 2;
var FACE_UP = 3;
//CLASS USER
function User()
{
    this.id = -1;
    this.name = "anonymous";
    this.position = [0,0];
    this.target_position = [0,0];
    this.anim = "idle";
    this.facing = FACE_RIGHT;
    this.room_id = -1;
}

User.prototype.fromJSON = function(json,to_target){
    this.id = json.id;
    this.name = json.name;
    if(to_target){
         this.target_position = json.position;
    }else{
        this.position = json.position
    }
    this.anim = json.anim;
    this.facing = json.facing;
    this.room_id = json.room_id;
}

User.prototype.toJSON = function(){
    return {
        id : this.id,
        name : this.name,
        position : this.position.concat(),
        anim : this.anim,
        facing : this.facing,
        room_id: this.room_id
    }    
}
//CLASS ROOM
function Room()
{
    this.id = -1;
    this.sprites = [];
    this.users = [];
}

Room.prototype.fromJSON = function(json){
    this.id = json.id;
    this.sprites = json.sprites.concat();
    if(json.users)
        this.users = json.users.concat();
}

Room.prototype.toJSON = function(){
    return {
        id: this.id,
        sprites: this.sprites.concat(),
        users: this.users.concat()
    };
}

Room.prototype.enterUser = function(user){
    this.users.push( user.id );
    user.room_id = this.id;
}

Room.prototype.leaveUser = function(user){
    var index = this.users.indexOf( user.id);
    if(index != -1){
        this.users.splice(index, 1);
    }  
}
Room.prototype.isUserInside = function(user){
    return this.users.indexOf (user.id) != -1;
}

Room.prototype.getRoomUsers = function(){
        var users_info = [];
        //Get data from users on the room
        for(var j = 0; j< this.users.length; j++){

            var user_id = this.users[j];
            var user = WORLD.users_by_id[user_id];
            if(user){
                users_info.push(user.toJson());  
            }     
        }
        return users_info;
}

var world_demo = {
    rooms : [
        {
            sprites: [
                {src:"img/hall.png", x:0, y:0},
                {src:"img/hall.png", x:-500, y:0}
            ]
        },
        {
            sprites: [
                {src:"img/hall.png", x:0, y:0},
                {src:"img/hall.png", x: 0, y: -300}
            ]
        }
    ],
};
//WORLD
var WORLD = {
    rooms: [],
    users: [],
    users_by_id: {},
    local_user: null,

    init: function()
    {
        //this.loadWorld( world_demo );
        //this.local_user = this.createUser();
       // this.rooms[0].enterUser( this.local_user);
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

   /* createUser: function()
    {
        var user = new User();
        user.id = 0;
        this.users.push(user);
        return user;
    }*/


};

//CORE.modules.push(WORLD);
if ( typeof (module) != "undefined" ){
    module.exports = {
        User,
        Room,
        WORLD,
        FACE_RIGHT,
        FACE_BOTTOM,
        FACE_LEFT,
        FACE_UP
    }
}
