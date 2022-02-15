var CORE = {
    //state of app
    last_time:null,
    canvas: null,
    server: null,
    login_button: null,
    mouse_pos: [0,0],
    
    modules: [],
   
    //settings
    server_url: "wss://ecv-etic.upf.edu/node/9026/ws/",

    init: function(){
        this.last_time = performance.now();
        this.canvas = document.querySelector("#canvas");
        this.login_button = document.querySelector("#login input[type='submit']");

        GFX.init(this.canvas);
        WORLD.init();
        LOGIC.init();
        /*
        CLIENT.init(this.server);
        
        */

        //bind events
        this.login_button.addEventListener("click", this.login.bind(this));
        this.canvas.addEventListener("mousedown", this.processMouse.bind(this));
        this.canvas.addEventListener("mousemove", this.processMouse.bind(this));
        this.canvas.addEventListener("mouseup", this.processMouse.bind(this));
        //TEST CHANGE ROOM
        document.body.addEventListener("keydown", this.processKey.bind(this));
        //END TEST
        this.loop();
    },

    login: function()
    {
        var login = document.getElementById("login");
        var chat_app = document.getElementById("chatApp");
        var login_name = document.querySelector("#login input[type='name']").value;
        var login_password = document.querySelector("#login input[type='password']").value;
        var login_avatar_id = parseInt(document.querySelector("#login #avatar-select").value);
                
        if(login_name != "" && login_password != ""){  //si los campos de inicio de sesión están rellenados 
            //oculta login y muestra chat
            if (login.style.display == "") {
                login.style.display = "none";
            }
            if(chat_app.style.display == "none") {
                chat_app.style.display = "";
            }        
            this.server = new WebSocket(this.server_url);
            CLIENT.init(this.server, login_name, login_password, login_avatar_id); 
        } 
    },

    draw: function() 
    {
        GFX.draw();
    },

    update: function(dt){
        LOGIC.update(dt);
    },
    //TEST
    processKey: function(e){
        if(e.key == "ArrowRight"){
            LOGIC.changeRoomRight();
        }
        if(e.key == "ArrowLeft"){
            LOGIC.changeRoomLeft();

        }
    },
    //END TEST
    processMouse: function(e){
        var rect = this.canvas.getBoundingClientRect();
        var canvas_x =  this.mouse_pos[0] = e.clientX - rect.left;
        var canvas_y = this.mouse_pos[1] =e.clientY - rect.top;
    
        if(e.type == "mousedown")
        {
            var target_x = canvas_x - (GFX.sprite_width / 2 * GFX.scale);

            this.mouse_pos[0] = target_x;
            WORLD.local_user.target_position[0] = target_x;

            GFX.checkObjects(canvas_x, canvas_y);
            //send to server to update my position to all users
            LOGIC.tick();


 
        }
        else if(e.type == "mousemove")
        {
    
        }
        else //mouseup
        {
        }
    },

    loop: function(){
        
        this.draw();
        /*
        if(users.length){
                for (let i = 0; i < users.length; i++) {
                    draw_other(i);
                }  
        }
        */
        //to compute seconds since last loop
        var now = performance.now();
        //compute difference and convert to seconds
        var elapsed_time = (now - this.last_time) / 1000; 
        //store current time into last time
        this.last_time = now;

        //now we can execute our update method
        this.update( elapsed_time );

        //request to call loop() again before next frame
        requestAnimationFrame( this.loop.bind(this) );
    }
};