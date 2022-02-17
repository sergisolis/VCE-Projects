
var ANIMS = {
    idle: [0],
    walk: [2,3,4,5,6,7,8]
}

//images container
var IMAGES = {};

function getImage(url) {
    var img = IMAGES[url];
	//check if already loaded
	if(img)
		return img;
	//if no loaded, load and store
	var img = IMAGES[url] = new Image();
	img.src = url;
    IMAGES[url] = img;
	return img;
}

var GFX = {
    canvas: null,
    sprite_width: null,
    sprite_height: null,
    scale: 1,

    min_room_pos: 0,
    max_room_pos: 0,
    room_width: 0,

    init: function(canvas)
    {
        this.canvas = canvas;
        this.sprite_width = 32;
        this.sprite_height = 64;
        this.scale = 5;
    },

    draw: function(){

        var canvas = this.canvas;
        canvas.width = canvas.parentNode.offsetWidth;
        canvas.height = canvas.parentNode.offsetHeight;
        ctx = canvas.getContext("2d");

        if(WORLD.local_user){
             this.drawRoom(ctx, WORLD.local_user);
        }else{
                ctx.fillStyle = "white";
                ctx.font = "40px Arial"
                ctx.fillText ("Connecting...",100,100);
        }
    },

    drawCharacter: function (ctx, sprites, user)
    {
        var centerx = canvas.width * 0.5;
        centerx -= WORLD.local_user.position[1];

        var w = 32; //sprite width
	    var h = 64; //sprite height
        var t = performance.now() * 0.001;

        var anim = ANIMS[ user.anim];
        var frame_index = anim[Math.floor(t * 10) % anim.length];
        var row = user.facing * 64;
        if (user.id == WORLD.local_user.id){
            var actual_pos = this.canvas.width/2;
            ctx.drawImage(sprites, frame_index*32, row, 32, 64, actual_pos, 650, this.sprite_width * this.scale, this.sprite_height * this.scale);
        }else{
            var actual_pos = user.position[1];
            ctx.drawImage(sprites, frame_index*32, row, 32, 64, centerx + actual_pos, 650, this.sprite_width * this.scale, this.sprite_height * this.scale);
        }       

        //name over user
        ctx.font = "50px VT323";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        //user name
        if(user.id != WORLD.local_user.id){
            var actual_pos = user.position[1];
            var diff = parseInt(Math.abs(user.position[0] - WORLD.local_user.position[0]));
            ctx.fillText(user.name+" ("+diff+") ", centerx + actual_pos + (this.sprite_width / 2 * this.scale), 640);
        }else{
            var actual_pos = this.canvas.width/2;
            ctx.fillText(user.name, actual_pos + (this.sprite_width / 2 * this.scale), 640);
        }
    },

    drawRoom: function(ctx, main_user)
    {
        var canvas = ctx.canvas;
        var t = performance.now() * 0.001;
        var centerx = canvas.width * 0.5;
        var centery = canvas.height * 0.5;
        
        var bg = getImage("img/hall.png");
        ctx.imageSmoothingEnabled = false;

        centerx -= main_user.position[1];
        
        ctx.save();
        //ctx.translate(centerx,centery - bg.height * 0.5);

        var room = WORLD.rooms[main_user.room_id];
        if (!room)
        {
           return; 
        }
        
        for (var i = 0; i < room.sprites.length; i++)
        {
            var sprite = room.sprites[i];
            var img = getImage( sprite.src);

            ctx.drawImage (img, centerx + sprite.x, sprite.y);
        }

        //ctx.drawImage(bg,0,0);
        //ctx.drawImage(bg,-bg.width,0);
        
        for (var i = 0; i < room.room_users.length; i++)
        {
            var user_index = room.room_users[i];
            var user = WORLD.users_by_id[ user_index ];

            if(!user){
                continue;
            }
            var avatar = this.selectAvatar(user.avatar_id);
            var sprites = getImage(avatar);
            this.drawCharacter(ctx, sprites, user)
            
        }
        
        ctx.restore();
    },

    selectAvatar: function(avatar_id){
        var avatar = "";
        switch(avatar_id){
            case 1: avatar = "img/man1-spritesheet.png"; break;
            case 2: avatar = "img/woman1-spritesheet.png"; break;
            case 3: avatar = "img/man2-spritesheet.png"; break;
            case 4: avatar = "img/woman2-spritesheet.png"; break;
            default: avatar = "img/man1-spritesheet.png"; break;
        }
        return avatar;
    },

    initObjects: function(main_user){

    },

    

    changeObjects: function(){

    },

    displayText: function(message, my_name){
        var chat = document.querySelector("#chat1"); 
        var chat_div = document.createElement("div");
        chat_div.className = "chat"
        var message_div = document.createElement("div");
        var profile_name = document.createElement('h3');
        var text = document.createElement('span');
         profile_name.innerHTML = message.name;
        text.innerHTML = message.content;
        message_div.className = "msg";
        profile_name.className = "profileName";
        text.className = message.type;
        if (message.name == my_name){   
            profile_name.style.color = "orange";
        }
        message_div.appendChild(profile_name);
        message_div.appendChild(text);
        chat_div.appendChild(message_div);
        chat.appendChild(chat_div);
    },

    clearChat: function(){
        var chat = document.querySelector("#chat1"); 
        while (chat.firstChild) {
            chat.removeChild(chat.lastChild);
          }
    }

};

CORE.modules.push(GFX);