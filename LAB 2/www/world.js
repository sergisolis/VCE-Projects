function User()
{
    this.id = -1;
    this.name = "anonymous";
    this.position = [0,0];
    this.target_position = [0,0];
    this.anim = "idle";
    this.facing = FACE_RIGHT;
}

var WORLD = {
    roms: {},
    users: [],
    local_user: null,

    init: function()
    {
        this.local_user = this.createUser();
    },

    createUser: function()
    {
        var user = new User();
        this.users.push(user);
        return user;
    }
}