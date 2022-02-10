var CLIENT = {
    server: null,
    name: "",
    password: "",

    init: function(server, name, password){
        this.server = server;
        this.name = name;
        this.password = password;
        this.server.onmessage = this.processMessage.bind(this); 
        this.server.onopen = this.setServer.bind(this);
    },

    setServer: function(e){
        console.log("Conexión establecida");
        console.log("Enviando al servidor");
        var login_msg = {
            type: "login",
            username: "",
            password: ""
        };
        login_msg.username = this.name;
        login_msg.password = this.password;
        login_msg.avatar_id = 1;
        var msg = JSON.stringify(login_msg);
        this.server.send(msg)
    },

    processMessage: function(e){
        var msg = JSON.parse(e.data);
        console.log("RECEIVED: " + e.data);
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
    },
    send: function(data, type)
    {
        var msg = JSON.stringify({type: type, content:data});
        this.server.send(msg);
    }
};