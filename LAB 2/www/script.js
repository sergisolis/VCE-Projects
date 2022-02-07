//Variables globales para almacenar datos sobre el usuario

var my_name = "";
var my_password = "";
var my_id = "";
var my_avatar = "";
var selected_chat = "1";
var socket;

//Default message types, base de datos y array de usuarios
var msg = {
	type: "text",
	content: "",
	username: ""
};
var typing = {
    type: "typing",
	content: "",
	username: ""
};
var history = {
    type: "text",
	content: "",
	username: ""
};
var DB = {
    type: "history",
    content: []
};
var users = [];

var login_msg = {
    type: "login",
	username: "",
	password: ""
};

//Variables globales de elementos html para realizar cambios en la estructura

var login_name_input = document.querySelector("#login input[type='name']");
var login_password_input = document.querySelector("#login input[type='password']");
var login_button = document.querySelector("#login input[type='submit']");
var input = document.querySelector("input.input");
var send_button = document.querySelector("button.buttonSend");

//Funciones para iniciar sesión en la app

function login() {
    console.log("jajajaj");
    var login = document.getElementById("login");
    var chat_app = document.getElementById("chatApp");
    var login_name = document.querySelector("#login input[type='name']").value;
    var login_password = document.querySelector("#login input[type='password']").value; 
    
    my_name = login_name;
    my_password = login_password;
    
    if(login_name != "" && login_password != ""){  //si los campos de inicio de sesión están rellenados 
        //oculta login y muestra chat
        if (login.style.display == "") {
            login.style.display = "none";
        }
        if(chat_app.style.display == "none") {
            chat_app.style.display = "";
        }
        
        //setServer();    //se conecta al servidor cuando los parámetros de login están rellenados
        socket = new WebSocket('wss://ecv-etic.upf.edu/node/9026/ws/');
        setServer(socket);
        

    } 
}

//Funciones para escribir y procesar mensajes

function onKeyDown(func, e){
    //si alguien escribe en el chat global mostramos su nombre mientras escribe
    if(func == processInput && selected_chat == "1"){
        typing.username = my_name;
        typing.content = "global";
        
    }else if (func == processInput && selected_chat != "1"){
        typing.username = my_name;
        typing.content = "private";
    }
    if(e.code == "Enter"){
        msg.type = "text";
        func();        
    }
}

function processInput(e){
    var str = "";
    str += input.value;
    // evita enviar cadenas vacías
    if(input.value){
        addMessage(str);
    }
    input.value = "";
}

function addMessage(str){
    msg.content = str;
    msg.username = my_name;
    displayMessageSend(msg);
    msg.type = "text"
    var str_msg = JSON.stringify(msg);
    socket.send(str_msg);
}

function displayMessageSend(message){   //crear un mensaje con el contenido enviado para mostrar en el chat
    var chat = document.querySelector("#chat" + selected_chat); 
    var chat_zone_myself = document.createElement("div");
    chat_zone_myself.className = "chatZoneMyself"
    var message_div = document.createElement("div");
    var profile_name = document.createElement('h3');
    var text = document.createElement('span');
    profile_name.innerHTML = message.username;
    text.innerHTML = msg.content;
    message_div.className = "msg";
    profile_name.className = "profileName";
    text.className = message.type;
    message_div.appendChild(profile_name);
    message_div.appendChild(text);
    chat_zone_myself.appendChild(message_div);
    chat.appendChild(chat_zone_myself);
}

//Server

async function setServer(socket){
    try{
        const sock = await socket;
        sock.onopen = function(e) {
            console.log("Conexión establecida");
            console.log("Enviando al servidor");
            login_msg.username = my_name;
            login_msg.password = my_password;
            var msg = JSON.stringify(login_msg);
            sock.send(msg)
        };
        
        sock.onmessage = function(event) {
            console.log('Datos recibidos del servidor');
        };
        
        sock.onclose = function(event) {

        };
        
        sock.onerror = function(error) {
            alert(`[error] ${error.message}`);
        };
        
    } catch (err){
        console.log(err);
    }
}

//Registro de eventos al iniciar y cerrar sesión
login_button.addEventListener("click", login);

//Registro de eventos del chat
input.addEventListener("keydown", onKeyDown.bind(null,processInput));
send_button.addEventListener("click", processInput);