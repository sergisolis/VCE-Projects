var LOGIC = {
    input_text: null,
    send_button: null,

    init: function(){
        this.input_text = document.querySelector("input.input");
        this.send_button = document.querySelector("button.buttonSend");
        //bind events
        this.input_text.addEventListener("keydown", this.onKeyDown.bind(this));
        this.send_button.addEventListener("click", this.processInput.bind(this));

        //TEST TICK
        //setInterval(this.tick.bind(this), 500);
    },

    update: function(dt){
        if (WORLD.local_user)
        {
            for (let i = 0; i < WORLD.users.length; i++) {
                this.updateUserInput(dt, WORLD.users[i]);
            }  
        }
    },
    
    tick: function(){
        if(WORLD.local_user){
        var update = {
            type: "user_update",
            user: WORLD.local_user.toJSON()
        }
        CLIENT.send(update);
      }
    },

    lerp: function(a,b,f)
    {
	return a * (1-f) + b * f;
    },

    updateUserInput: function( dt, user )
    {
        user.anim = "idle";

        var diff = Math.abs(user.position[0] - user.target_position[0]);

        if(user.position[0] < user.target_position[0] && diff > 5){
            user.anim = "walk";
            user.facing = FACE_RIGHT;
            user.position[0] = this.lerp( user.position[0], user.target_position[0], 0.01 );
        } else if(user.position[0] > user.target_position[0] && diff > 5) {
            user.anim = "walk";
            user.facing = FACE_LEFT;
            user.position[0] = this.lerp( user.position[0], user.target_position[0], 0.01 );
        }
        else {
            user.anim = "idle";
            //user.position[0] = user.target_position[0];
        }

       
        
    },
    //ONLY FOR TESTING
    changeRoomRight(){
        var msg = {
            type: "change_room",
            room_id: WORLD.local_user.room_id + 1,
        }
        CLIENT.send(msg);
    },
    changeRoomLeft(){
        var msg = {
            type: "change_room",
            room_id: WORLD.local_user.room_id - 1,
        }
        CLIENT.send(msg);
    },
    //END OF TESTING
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
        // evita enviar cadenas vacías
        if(this.input_text.value){
            this.input_text.value = "";
            
            this.addText(str);
        }
    },
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
    UpdateUserInfo: function(user_info){
        var user = WORLD.users_by_id[user_info.id];
        if(!user)
        {
            user = new User();
            WORLD.users.push (user);
            WORLD.users_by_id[user_info.id] =  user;
        }
        user.fromJSON(user_info);
        return user;
    },
    onMessage: function(msg)
    {

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
       

    
        /*
        if ( msg.type == "text"){
            displayMessageSend(msg);
        }    
        else if (msg.type == "position"){
            var new_user = {};
            new_user.id = msg.id;
            new_user.position_x = msg.position_x;
            addUserCanvas(new_user);
        }
        else if (msg.type == "position_history"){
            for (let i = 0; i < msg.content.length; i++) {
                var previous_user = {};
                previous_user.id = msg.content[i].id;
                previous_user.position_x = msg.content[i].position_x;
                addUserCanvas(previous_user);
            }
        }
        */
    }
}

CORE.modules.push(LOGIC);