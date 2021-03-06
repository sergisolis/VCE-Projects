var CORE = {
  //state of app
  last_time: null,
  server: null,
  avatar_selector: null,
  login_button: null,
  register_button: null,
  chat_zone: null,
  mouse_pos: [0, 0],

  modules: [],

  //settings
  server_url: "wss://ecv-etic.upf.edu/node/9026/ws/",
  http_url: "https://ecv-etic.upf.edu/node/9026/",

  init: function () {
    this.last_time = performance.now();
    this.avatar_selector = document.getElementById("avatar-select");
    this.login_button = document.querySelector("#login input[type='submit']");
    this.register_button = document.querySelector("#register input[type='submit']");
    this.chat_zone = document.querySelector(".chatZone");
    this.enter_zone = document.getElementById("enterZone");
    this.app = document.getElementById("app");

    GFX.init();
    //WORLD.init();
    LOGIC.init();

    /*
        CLIENT.init(this.server);
        
        */

    //bind events
    //this.avatar_selector.addEventListener(
    //"click",
    //this.selectAvatar.bind(this)
    //);
    this.login_button.addEventListener("click", this.login.bind(this));
    this.register_button.addEventListener("click", this.register.bind(this));
    //this.loop();

    //check local storage
    if(localStorage.getItem("token")){
      this.useToken();
      this.app.style.display = "";
      this.enter_zone.style.display = "none";
      
    }
  },

  useToken: function() {

    const xhr = new XMLHttpRequest();

    xhr.open("POST", this.http_url+"login");
    

    var data = {
      "token": localStorage.getItem('token'),
    }
    var json = JSON.stringify(data);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json)

    xhr.onload = () => {
      console.log(JSON.parse(xhr.response));
   }

   xhr.onerror = () => {
    console.error('Request failed.');
   }

  },

  register: function () {
    var register_name = document.querySelector("#register input[type='text']").value;
    var register_password = document.querySelector("#register  input[type='password']" ).value;

    if (register_name != "" && register_password != "") {

      const xhr = new XMLHttpRequest();

      xhr.open("POST", this.http_url+"register");
      

      var data = {
        "name": register_name,
        "password": register_password
      }
      var json = JSON.stringify(data);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(json)

      xhr.onload = () => {
        console.log(JSON.parse(xhr.response));
     }

     xhr.onerror = () => {
      console.error('Request failed.');
  }

    } else {

      console.log("fill the form");

    }
  },
  login: function () {
    var login_name = document.querySelector("#login input[type='text']").value;
    var login_password = document.querySelector("#login input[type='password']" ).value;

    if (login_name != "" && login_password != "") {

      const xhr = new XMLHttpRequest();

      xhr.open("POST", this.http_url+"login");
      

      var data = {
        "name": login_name,
        "password": login_password
      }
      var json = JSON.stringify(data);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(json)

    
      xhr.onload = () => {
        console.log(JSON.parse(xhr.response));
        //localStorage.setItem('token', response.token);
     }

     xhr.onerror = () => {
      console.error('Request failed.');
     }

    } else {

      console.log("fill the form");

    }
  },

  /*login: function () {
    var login = document.getElementById("login");
    var chat_app = document.getElementById("chatApp");
    var login_name = document.querySelector("#login input[type='name']").value;
    var login_password = document.querySelector(
      "#login input[type='password']"
    ).value;
    var login_avatar_id = parseInt(
      document.querySelector("#login #avatar-select").value
    );

    if (login_name != "" && login_password != "") {
      //si los campos de inicio de sesi??n est??n rellenados
      //oculta login y muestra chat
      if (login.style.display == "") {
        login.style.display = "none";
      }
      if (chat_app.style.display == "none") {
        chat_app.style.display = "";
      }
      this.server = new WebSocket(this.server_url);
      CLIENT.init(this.server, login_name, login_password, login_avatar_id);
    }
  },*/

  selectAvatar: function () {},

  draw: function () {
    GFX.draw();
  },

  update: function (dt) {
    LOGIC.update(dt);
  },
  processMouse: function (e) {},

  loop: function () {},
};
