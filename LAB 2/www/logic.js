var LOGIC = {
    input_text: null,
    send_button: null,

    init: function(){
        this.input_text = document.querySelector("input.input");
        this.send_button = document.querySelector("button.buttonSend");
        //bind events
        this.input_text.addEventListener("keydown", this.onKeyDown.bind(this));
        this.send_button.addEventListener("click", this.processInput.bind(this));
    },

    update: function(dt){
        if (WORLD.local_user)
        {
            //WORLD.local_user.position[0] = this.lerp( WORLD.local_user.position[0], WORLD.local_user.target_position[0], 0.01 );
            this.updateUserInput(dt, WORLD.local_user);
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

        if(user.position[0] < user.target_position[0] && diff > 30){
            user.anim = "walk";
            user.facing = FACE_RIGHT;
            user.position[0] = this.lerp( user.position[0], user.target_position[0], 0.01 );
        } else if(user.position[0] > user.target_position[0] && diff > 30) {
            user.anim = "walk";
            user.facing = FACE_LEFT;
            user.position[0] = this.lerp( user.position[0], user.target_position[0], 0.01 );
        }
        else {
            user.anim = "idle";
            user.position[0] = user.target_position[0];
        }

       
        
    },

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
        if(this.input_text){
            this.input_text.value = "";
            
            this.addMessage(str);
        }
    },
    addMessage: function(str)
    {
        var msg = {
            content: "",
            name: ""
        }
        msg.content = str;
        msg.name = CLIENT.name;
        GFX.displayMessage(msg, CLIENT.name);
        /*
        msg.type = "text"
        var str_msg = JSON.stringify(msg);
        socket.send(str_msg);
        */
    }
}