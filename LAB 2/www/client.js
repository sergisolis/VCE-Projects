var CLIENT = {
    server: null,
    name: "",
    password: "",

    init: function(server, name, password){
        this.server = server;
        this.name = name;
        this.password = password;
        this.server.onopen = this.setServer.bind(this);
        this.server.onmessage = this.processMessage.bind(this); 
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
        LOGIC.onMessage(msg)
        
    },
    send: function(data, type)
    {
        var msg = JSON.stringify({type: type, content:data});
        this.server.send(msg);
    }
};

CORE.modules.push(CLIENT);