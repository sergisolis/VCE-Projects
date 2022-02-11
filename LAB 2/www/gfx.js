var FACE_RIGHT = 0;
var FACE_BOTTOM = 1;
var FACE_LEFT = 2;
var FACE_UP = 3;

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

    init: function(canvas)
    {
        this.canvas = canvas;
        this.sprite_width = 32;
        this.sprite_height = 64;
        this.scale = 5;

    },

    draw: function(){
        this.drawRoom(this.canvas, WORLD.local_user);
    },

    drawCharacter: function (sprites, user)
    {
        var w = 32; //sprite width
	    var h = 64; //sprite height
        var t = performance.now() * 0.001;

        var anim = ANIMS[ user.anim];
        var frame_index = anim[Math.floor(t * 10) % anim.length];
        var row = user.facing * 64;
        ctx.drawImage(sprites, frame_index*32, row, 32, 64, user.position[0], 650, this.sprite_width * this.scale, this.sprite_height * this.scale);

        ctx.font = "50px VT323";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("user1", user.position[0] + (this.sprite_width / 2 * this.scale), 640);
    },

    drawRoom: function(canvas, main_user)
    {
        var t = performance.now() * 0.001;
        canvas.width = canvas.parentNode.offsetWidth;
        canvas.height = canvas.parentNode.offsetHeight;
        ctx = canvas.getContext("2d");
        var centerx = canvas.width * 0.5;
        var centery = canvas.height * 0.5;
        
        var bg = getImage("img/hall.png");
        ctx.imageSmoothingEnabled = false;

        centerx -= main_user.position[0];
        
        ctx.save();
        //ctx.translate(centerx,centery - bg.height * 0.5);

        var room = WORLD.rooms[main_user.room_index];
        if (!room)
        {
           return; 
        }
        
        for (var i = 0; i < room.sprites.length; i++)
        {
            var sprite = room.sprites[i];
            var img = getImage( sprite.src);
            ctx.drawImage (img, sprite.x, sprite.y);
        }

        //ctx.drawImage(bg,0,0);
        //ctx.drawImage(bg,-bg.width,0);
        
        for (var i = 0; i < room.users.length; i++)
        {
            var user_index = room.users[i];
            var user = WORLD.users[ user_index ];

            if(!user){
                continue;
            }

            var sprites = getImage("img/man1-spritesheet.png");
            this.drawCharacter(sprites, user)
            
        }
        
        ctx.restore();
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