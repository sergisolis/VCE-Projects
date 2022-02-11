function User()
{
    this.id = -1;
    this.name = "anonymous";
    this.position = [0,0];
    this.target_position = [0,0];
    this.anim = "idle";
    this.facing = FACE_RIGHT;
    this.room_index = -1;
}

User.prototype.fromJSON = function(json){
    this.id = json.id;
    this.name = json.name;
    this.position = json.position;
    this.anim = json.anim;
    this.facing = json.facing;
    this.room_index = json.room_index;
}

User.prototype.toJSON = function(){
    return {
        id : this.id,
        name : this.name,
        position : this.position.concat(),
        anim : this.anim,
        facing : this.facing,
        room_index: this.room_index
    }    
}

function Room()
{
    this.index = -1;
    this.sprites = [];
    this.users = [];
}

Room.prototype.fromJSON = function(json){
    this.sprites = json.sprites.concat();
    if(json.users)
        this.users = json.users.concat();
}

Room.prototype.toJSON = function(){
    return {
        sprites: this.sprites.concat(),
        users: this.users.concat()
    };
}

Room.prototype.enterUser = function(user){
    this.users.push( user.id );
    user.room_index = this.index;
}

Room.prototype.leaveUser = function(user){
    var index = this.users.indexOf( user.id);
    this.users.splice(index, 1);
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

var WORLD = {
    rooms: [],
    users: [],
    local_user: null,

    init: function()
    {
        this.loadWorld( world_demo );
        this.local_user = this.createUser();
        this.rooms[0].enterUser( this.local_user);
    },

    loadWorld: function(json){
        for (var i = 0; i < json.rooms.length; i++){
            var room_json = json.rooms[i];
            var room = new Room();
            room.index = i;
            room.fromJSON(room_json);
            this.rooms.push(room);
        }
    },

    createUser: function()
    {
        var user = new User();
        user.id = 0;
        this.users.push(user);
        return user;
    }


};

CORE.modules.push(WORLD);