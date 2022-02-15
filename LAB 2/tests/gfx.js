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

    objects_state: false,
    objects : [],

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
             if (this.objects_state == false){
                this.initObjects(WORLD.local_user);
             }
        }else{
                ctx.fillStyle = "white";
                ctx.font = "40px Arial"
                ctx.fillText ("Connecting...",100,100);
        }
    },

    drawCharacter: function (ctx, sprites, user)
    {
        var centerx = canvas.width * 0.5;
        centerx -= WORLD.local_user.position[0];

        var w = 32; //sprite width
	    var h = 64; //sprite height
        var t = performance.now() * 0.001;

        var anim = ANIMS[ user.anim];
        var frame_index = anim[Math.floor(t * 10) % anim.length];
        var row = user.facing * 64;
        ctx.drawImage(sprites, frame_index*32, row, 32, 64, centerx + user.position[0], 650, this.sprite_width * this.scale, this.sprite_height * this.scale);
       //user.position[0] = LOGIC.lerp (user.target_position[0], user.position[0], 0.9)

        //name over user
        ctx.font = "50px VT323";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(user.name, centerx + user.position[0] + (this.sprite_width / 2 * this.scale), 640);
    },

    drawRoom: function(ctx, main_user)
    {
        var canvas = ctx.canvas;
        var t = performance.now() * 0.001;
        var centerx = canvas.width * 0.5;
        var centery = canvas.height * 0.5;
        
        var bg = getImage("img/hall.png");
        ctx.imageSmoothingEnabled = false;

        centerx -= main_user.position[0];
        
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

    initObjects: async function(main_user){
        var room = await WORLD.rooms[main_user.room_id];
        if (room != undefined){
            for (var i = 0; i < room.sprites.length; i++)
            {
                var sprite = room.sprites[i];
                var sprite_name = sprite.src.split("/").pop();

                var img = IMAGES[sprite.src];

                var object = {
                    name: sprite_name,
                    src:  sprite.src,
                    x: sprite.x,
                    y: sprite.y,
                    w: img.width,
                    h: img.height
                }
                this.objects.push(object);
            }
            this.objects_state = true;    
        }
    },

    checkObjects: function(mouse_x, mouse_y){
        for (var i = 0; i < this.objects.length; i++)
        {
            var object = this.objects[i];
            var centerx = canvas.width * 0.5;
            if (this.objects[i].name != 'background.png'){
                centerx -= WORLD.local_user.position[0];
                
                if (mouse_x >= (object.x + centerx) && mouse_x <= (object.x + object.w + centerx) && mouse_y >= object.y && mouse_y <= (object.y + object.h)){
                    console.log("touching object " + object.src);
                    
                    var room = WORLD.rooms[WORLD.local_user.room_id];
                    for (var i = 0; i < room.sprites.length; i++)
                    {
                        if (object.src == room.sprites[i].src){
                            room.sprites[i].src = "img/door_open.png";
                        }
                    }
                    
                }
                
            }
        }
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
    }

};

CORE.modules.push(GFX);