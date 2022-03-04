var CHARACTER_BIT = 0b100;
var ROOM_BIT = 0b010;
var DEBUG_BIT = 0b001;

//global settings
var bg_color = [0.1, 0.1, 0.1, 1];

var GFX = {
  context: null,
  scene: null,
  renderer: null,
  pbrpipeline: null,
  camera: null,
  character: null,
  debug_ball: null,
  hover_node: null,
  walk_area: new WalkArea(),
  area_points: [],
  anim_idle: null,
  anim_walk: null,
  skeleton: new RD.Skeleton(),

  girl: null,
  girl_pivot: null,

  init: function () {
    //create the rendering context
    this.context = GL.create({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.renderer = new RD.Renderer(this.context);
    document.body.appendChild(this.renderer.canvas); //attach
    this.scene = new RD.Scene();
    this.renderer.setDataFolder("data");
    this.renderer.autoload_assets = true;
    this.camera = new RD.Camera();
    this.camera.perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 1000);
    this.camera.lookAt([0, 40, 100], [0, 20, 0], [0, 1, 0]);

    var mat = new RD.Material({ textures: { color: "girl/girl.png" } });
    mat.register("girl");

    this.girl_pivot = new RD.SceneNode({
      position: [-40, 0, 0],
    });

    this.girl = new RD.SceneNode({
      scaling: 0.3,
      mesh: "girl/girl.wbin",
      material: "girl",
    });
    this.girl.layers = CHARACTER_BIT;
    this.girl.flags.ignore_collisions = true;
    this.girl_pivot.addChild(this.girl);
    this.scene.root.addChild(this.girl_pivot);
    this.character = this.girl_pivot;
    this.girl.skeleton = this.skeleton;

    var debug_ball = new RD.SceneNode({
      mesh: "sphere",
      shader: "flat",
      scale: 1,
      color: [1, 1, 0, 1],
    });
    this.debug_ball.layers = DEBUG_BIT;
    this.scene.root.addChild(debug_ball);
    this.anim_idle = new RD.SkeletalAnimation();
    this.anim_idle.load("data/girl/idle.skanim");
    this.anim_walk = new RD.SkeletalAnimation();
    this.anim_walk.load("data/girl/walking.skanim");

    var room = new RD.SceneNode({ scaling: 40 });
    room.loadGLTF("data/room.gltf");
    room.layers = ROOM_BIT;
    this.scene.root.addChild(room);
  },
  // main loop ***********************
  loop: function () {
    //main draw function
    this.context.ondraw = function () {
      gl.canvas.width = document.body.offsetWidth;
      gl.canvas.height = document.body.offsetHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      var current_camera = this.camera;
      this.camera.target = this.character.localToGlobal([0, 8, 0]);

      //clear
      this.renderer.clear(bg_color);
      //render scene
      this.renderer.render(scene, current_camera);

      this.renderer.renderPoints(
        walk_area.getVertices(),
        null,
        camera,
        null,
        null,
        5,
        gl.LINES
      );
    };
  },
  update: function () {
    //main update
    this.context.onupdate = function (dt) {
      this.scene.update(dt);

      var ray = this.camera.getRay(gl.mouse.x, gl.mouse.y);
      var coll = vec3.create();
      hover_node = this.scene.testRay(ray, coll, 1000, ROOM_BIT, true);
      if (hover_node) {
        this.debug_ball.position = coll;
      }

      var t = getTime();
      var anim = this.anim_idle;
      var time_factor = 1;

      if (gl.keys["UP"]) {
        this.character.moveLocal([0, 0, 1]);
        this.character.position = walk_area.adjustPosition(character.position);
        anim = this.anim_walk;
      } else if (gl.keys["DOWN"]) {
        this.character.moveLocal([0, 0, -1]);
        anim = this.anim_walk;
        time_factor = -1;
      }
      if (gl.keys["LEFT"]) this.character.rotate(90 * DEG2RAD * dt, [0, 1, 0]);
      else if (gl.keys["RIGHT"])
        this.character.rotate(-90 * DEG2RAD * dt, [0, 1, 0]);

      anim.assignTime(t * 0.001 * time_factor);
      this.girl.skeleton.copyFrom(anim.skeleton);

      anim.assignTime(0);

      var now = getTime() * 0.001;
    };
  },

  displayText: function (message, my_name) {
    var chat = document.querySelector("#messages");
    var message_div = document.createElement("div");
    var profile_name = document.createElement("h3");
    var text = document.createElement("span");
    profile_name.innerHTML = message.name;
    text.innerHTML = message.content;
    message_div.className = "msg";
    profile_name.className = "profileName";
    text.className = message.type;
    if (message.name == my_name) {
      profile_name.style.color = "#002830";
      message_div.style.background = "#00677C";
    }
    message_div.appendChild(profile_name);
    message_div.appendChild(text);
    chat.appendChild(message_div);
    CORE.chat_zone.scrollTop = 1000000;
  },
};
