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
  walk_area: null,
  area_points: [],
  anim_idle: null,
  anim_walk: null,
  skeleton: null,
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
    this.walk_area = new WalkArea();
    this.walk_area.fromJSON({
      areas: [
        [
          [-126.33546447753906, 0, 42.325103759765625],
          [-63.246131896972656, 0, 39.76831817626953],
          [-63.94060516357422, 0, 14.181144714355469],
          [-60.03047180175781, 0, 13.87972640991211],
          [-58.923667907714844, 0, 39.99010467529297],
          [40.23691940307617, 0, 39.16050720214844],
          [40.066471099853516, 0, -39.92578125],
          [-58.988040924072266, 0, -39.411346435546875],
          [-59.351104736328125, 0, -13.172233581542969],
          [-63.16820526123047, 0, -12.299148559570312],
          [-64.07301330566406, 0, -39.00634002685547],
          [-124.12036895751953, 0, -39.64881134033203],
        ],
      ],
    });
    this.skeleton = new RD.Skeleton();
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

    this.debug_ball = new RD.SceneNode({
      mesh: "sphere",
      shader: "flat",
      scale: 1,
      color: [1, 1, 0, 1],
    });
    this.debug_ball.layers = DEBUG_BIT;
    this.scene.root.addChild(this.debug_ball);
    this.anim_idle = new RD.SkeletalAnimation();
    this.anim_idle.load("data/girl/idle.skanim");
    this.anim_walk = new RD.SkeletalAnimation();
    this.anim_walk.load("data/girl/walking.skanim");

    var room = new RD.SceneNode({ scaling: 40 });
    room.loadGLTF("data/room.gltf");
    room.layers = ROOM_BIT;
    this.scene.root.addChild(room);
    this.loop();
    this.update();
    this.input();
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
      this.renderer.render(this.scene, current_camera);

      this.renderer.renderPoints(
        this.walk_area.getVertices(),
        null,
        this.camera,
        null,
        null,
        5,
        gl.LINES
      );
    }.bind(this);
  },
  update: function () {
    //main update
    this.context.onupdate = function (dt) {
      this.scene.update(dt);

      var ray = this.camera.getRay(gl.mouse.x, gl.mouse.y);
      var coll = vec3.create();
      this.hover_node = this.scene.testRay(ray, coll, 1000, ROOM_BIT, true);
      if (this.hover_node) {
        this.debug_ball.position = coll;
      }

      var t = getTime();
      var anim = this.anim_idle;
      var time_factor = 1;

      if (gl.keys["UP"]) {
        this.character.moveLocal([0, 0, 1]);
        this.character.position = walk_area.adjustPosition(
          this.character.position
        );
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
    }.bind(this);
  },
  //user input ***********************
  input: function () {
    //detect clicks
    this.context.onmouseup = function (e) {
      if (e.click_time < 200) {
        //fast click
        //compute collision with floor plane
        var ray = this.camera.getRay(e.canvasx, e.canvasy);
        if (ray.testPlane(RD.ZERO, RD.UP)) {
          //collision
          console.log("floor position clicked", ray.collision_point);
          //walk_area.clear();
          //area_points.push(typedArrayToArray(ray.collision_point));
          //walk_area.addShape(area_points);
          this.debug_ball.position = ray.collision_point;
          /*
          if (walk_area.isInsideArea(ray.collision_point)) {
            debug_ball.position = ray.collision_point;
          }
      */
        }
      }
    }.bind(this);

    this.context.onmousemove = function (e) {
      if (e.dragging) {
        //orbit camera around
        //camera.orbit( e.deltax * -0.01, RD.UP );
        //camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
        this.camera.moveLocal([-e.deltax * 0.1, e.deltay * 0.1, 0]);
      }
    }.bind(this);

    this.context.onmousewheel = function (e) {
      //move camera forward
      this.camera.moveLocal([0, 0, e.wheel < 0 ? 10 : -10]);
    }.bind(this);

    //capture mouse events
    this.context.captureMouse(true);
    this.context.captureKeys();

    //launch loop
    this.context.animate();
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
