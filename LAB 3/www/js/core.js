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
    this.login_form = document.querySelector("#login form");
    this.register_form = document.querySelector("#register form");
    this.chat_zone = document.querySelector(".chatZone");

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
    this.login_form.addEventListener("submit", this.login.bind(this));
    this.register_form.addEventListener("submit", this.register.bind(this));
    //this.loop();
  },

  register: function () {
    var register_name = document.querySelector("#register form input[type='text']").value;
    var register_password = document.querySelector("#register form input[type='password']" ).value;

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

    } else {

      console.log("fill the form");

    }
  },
  login: function () {
    var login_name = document.querySelector("#login form input[type='text']").value;
    var login_password = document.querySelector("#login form input[type='password']" ).value;

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
      //si los campos de inicio de sesión están rellenados
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
