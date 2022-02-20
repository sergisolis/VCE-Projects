var CLIENT = {
    server: null,
    name: "",
    password: "",
    avatar_id: -1,

    init: function(server, name, password, avatar_id){
        this.server = server;
        this.name = name;
        this.password = password;
        this.avatar_id = avatar_id;
        this.server.onopen = this.setServer.bind(this);
        this.server.onmessage = this.processMessage.bind(this); 
    },

    setServer: function(e){
        console.log("Conexión establecida");
        console.log("Enviando al servidor");
        var login_msg = {
            type: "login",
            name: this.name,
            password: this.password,
            avatar_id: this.avatar_id
        };
        var msg = JSON.stringify(login_msg);
        this.server.send(msg)
    },

    processMessage: function(e){
        var msg = JSON.parse(e.data);
        LOGIC.onMessage(msg)
        
    },
    send: function(data)
    {
        if(!this.server){
            return;
        }
        var msg = JSON.stringify(data);
        this.server.send(msg);
    }
};

CORE.modules.push(CLIENT);