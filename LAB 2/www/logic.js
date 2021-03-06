//maps a value from one domain to another
function map_range( value, low1, high1, low2, high2) {
	var range1 = high1 - low1;
	var range2 = high2 - low2;
    return low2 + range2 * (value - low1) / range1;
};

var LOGIC = {
    input_text: null,
    send_button: null,
    emoji_button: null,
    emoji_table: null,
    emojis: null,

    init: function(){
        this.input_text = document.querySelector("input.input");
        this.send_button = document.querySelector("button.buttonSend");
        this.emoji_button = document.querySelector(".emojiButton");
        this.emoji_table = document.querySelector(".emojisTable");
        this.emojis = document.querySelectorAll(".emojis")
        

        //bind events
        this.input_text.addEventListener("keydown", this.onKeyDown.bind(this));
        this.send_button.addEventListener("click", this.processInput.bind(this));
        this.emoji_button.addEventListener("click", this.displayEmojiTable.bind(this));
        this.inputAddEmoji();

    },

    update: function(dt){
        if (WORLD.local_user)
        {
            for (let i = 0; i < WORLD.users.length; i++) {
                this.updateUserInput(dt, WORLD.users[i]);
            }  
        }
    },
    
    update_message: function(){
        if(WORLD.local_user){
        var update = {
            type: "user_update",
            user: WORLD.local_user.toJSON()
        }
        CLIENT.send(update);
      }
    },
    //linear interpolation
    lerp: function(a,b,f)
    {
	    return a * (1-f) + b * f;
    },

    updateUserInput: function( dt, user )
    {
        var diff = 0;
        user.anim = "idle";
        if((user.target_position[0] - user.position[0])  < 0){
            user.anim = "walk";
            user.facing = FACE_LEFT;
            //user.target_room = user.room_position + user.target_position[0];
            diff = Math.abs( user.position[0] - user.target_position[0]);
            if ( diff > 1 && user.position[0] >= GFX.min_room_pos){
                user.position[0] =  this.lerp( user.position[0], user.target_position[0], 0.05 );
                user.position[1] =  map_range(user.position[0],-100,100,0,GFX.canvas.width);
            }else {
                user.anim = "idle";
                
            } 
            
        }
        else if((user.target_position[0] - user.position[0]) > 0){
            user.anim = "walk";
            user.facing = FACE_RIGHT;
            //user.target_room = user.room_position + user.target_position[0];
            diff = Math.abs( user.position[0] - user.target_position[0]);
            if ( diff > 1 && user.position[0] <= GFX.max_room_pos){
                user.position[0] =  this.lerp( user.position[0], user.target_position[0], 0.05 );
                user.position[1] =  map_range(user.position[0],-100,100,0,GFX.canvas.width);
            }else {
                user.anim = "idle";
                
            } 
        }

    },
    //Change room message
    changeRoom(target_room){
        var msg = {
            type: "change_room",
            room_id: target_room
        }
        CLIENT.send(msg);
        GFX.clearChat();
    },

    //Send text on enter key
    onKeyDown: function(e)
    {
        if(e.code == "Enter"){
            this.processInput();        
        }
    },

    processInput: function()
    {
        var str = "";
        str += this.input_text.value;
        // evita enviar cadenas vac??as
        if(this.input_text.value){
            this.input_text.value = "";
            
            this.addText(str);
        }
    },
    //send text message
    addText: function(str)
    {
        var msg = {
            type: "text",
            content: "",
            name: "",
        }
        msg.content = str;
        msg.name = CLIENT.name;
        CLIENT.send(msg);
        GFX.displayText(msg, CLIENT.name);

    },
    //emoji table
    displayEmojiTable: function(){
        if(this.emoji_table.style.display == "none"){
            this.emoji_table.style.display = "";
        }else{
            this.emoji_table.style.display = "none";
        }
    },
    //add emoji
    inputAddEmoji: function(){           
    
        for (let i = 0; i < this.emojis.length; i++) {
            this.emojis[i].addEventListener("click", function(){
                this.input_text.value = this.input_text.value + this.emojis[i].innerHTML;
            }.bind(this));
        }
    },
    //Update user
    UpdateUserInfo: function(user_info){
        var user = WORLD.users_by_id[user_info.id];
        if(!user)
        {
            user = new User();
            user.fromJSON(user_info);
            WORLD.users.push (user);
            WORLD.users_by_id[user_info.id] =  user;
        }else
        {
            user.fromJSON(user_info);
        }

        return user;
    },
    //On message received perform different acctions depending on the protocol
    onMessage: function(msg)
    {
        if(msg.type == "connection_error"){
            var login = document.getElementById("login");
            var chat_app = document.getElementById("chatApp");
            var error = document.getElementById("error-display");
            error.style.display = "block";
            login.style.height = "635px";
            login.style.display = "";
            chat_app.style.display = "none";
            CORE.server.close();
        }

        if (msg.type == "login"){

            WORLD.local_user = this.UpdateUserInfo(msg.user);
        }
        if (msg.type == "room"){

            var room = WORLD.rooms[msg.room.id];
            WORLD.local_user.room_id = msg.room.id;

            if(!room){
                room = new Room();
                WORLD.rooms[msg.room.id] = room;
            }
            room.fromJSON( msg.room);
        }
        if (msg.type == "change_object"){
            var room = WORLD.rooms[msg.room.id];
            room.fromJSON(msg.room);
        }
        if ( msg.type == "text"){
            GFX.displayText(msg, CLIENT.name);
        }
        if (msg.type == "users"){

            var room = WORLD.rooms[ msg.room_id];
            if(room){
                for(var i=0; i < msg.users.length; i++){
                    var user_info = msg.users[i];
                    if(WORLD.local_user &&  user_info.id == WORLD.local_user.id){
                        continue;   
                    }
                    var user = this.UpdateUserInfo(user_info);
                    if(!room.isUserInside(user)){
                        room.enterUser(user);
                    }
                }
            //si no esta en el msg tiene que eliminarse
            for(var i=0; i < WORLD.users.length; i ++){
                var user = WORLD.users[i];
                var index = msg.users.map(function(e) { return e.id; }).indexOf(user.id);
                if(index == -1 ){
                    WORLD.users.splice(index,1);
                    delete WORLD.users_by_id[user.id];
                    room.leaveUser(user);
                }
            }
            }
        }
       
    },
    //check if objects are interactive to perform an action
    checkObjects: function(mouse_x, mouse_y){       
        var centerx = GFX.canvas.width * 0.5;
        centerx -= map_range(WORLD.local_user.position[0],-100,100,0,GFX.canvas.width);
        var room = WORLD.rooms[WORLD.local_user.room_id];
        for (var i = 0; i < room.sprites.length; i++){
            var sprite = room.sprites[i];
            if(this.checkObjectConditions(centerx,mouse_x,mouse_y,sprite,"door"))
                {
                    this.changeObject(sprite);
                    this.changeRoom(sprite.target_room);  
                    return true; 
                } 
            if(this.checkObjectConditions(centerx,mouse_x,mouse_y,sprite,"lampara")){
                this.changeObject(sprite);
                return true;
            }         
        }
        return false
    },
    //check objects helper function
    checkObjectConditions: function(centerx,mouse_x,mouse_y,sprite,type){
        if(sprite.type == type){ 
            var object = sprite;
            var img = IMAGES[object.src];
            var w = img.width;
            var h = img.height;
            if (mouse_x >= (object.x + centerx) && mouse_x <= (object.x + w + centerx) && mouse_y >= object.y && mouse_y <= (object.y + h)){
                return true;         
            }
            else{
                return false;
            }
        }
    },
    //send change object message
    changeObject: function(sprite){
        var msg = {
            type: "change_object",
            object: sprite
        }
        CLIENT.send(msg);
    },
    //compute room width
    roomWidth: function(){
        var min_pos = 1000000;
        var max_pos = -1000000;

        var min_width = 1000000;
        var max_width = -1000000;


        var total_background = 0;
        var room = WORLD.rooms[WORLD.local_user.room_id];
        for (var i = 0; i < room.sprites.length; i++){
            var sprite = room.sprites[i];
            if(sprite.type == "bg"){
                var background = room.sprites[i];
                var img = IMAGES[background.src];
                var w = img.width;
                //hack para que solo coja los fondos test
                if(w > 1000){
                    if (sprite.x <= min_pos){
                        min_pos = sprite.x;
                        min_width = w;
                    }
                    if (sprite.x >= max_pos){
                        max_pos = sprite.x;
                        max_width = w;
                    }
                    total_background += w;
            }
            }
        }
        var min_room_pos = min_pos + (min_width / 2);
        var max_room_pos = max_pos + (max_width / 2);

        GFX.min_room_pos = map_range(min_room_pos, 0, GFX.canvas.width, -100, 100);
        GFX.max_room_pos = map_range(max_room_pos, 0, GFX.canvas.width, -100, 100);

        GFX.room_width = total_background;
        return total_background;
    },
}

CORE.modules.push(LOGIC);