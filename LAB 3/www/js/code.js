var scene = null;
var renderer = null;
var pbrpipeline = null;
var camera = null;
var character = null;
var debug_ball = null;
var hover_node = null;
var walk_area = new WalkArea();
//walk_area.addRect([-100, 0, -100], 200, 200);

walk_area.fromJSON({
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
var area_points = [];
var anim_idle = null;
var anim_walk = null;
var skeleton = new RD.Skeleton();

var CHARACTER_BIT = 0b100;
var ROOM_BIT = 0b010;
var DEBUG_BIT = 0b001;

function init() {
  //create the rendering context
  var context = GL.create({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  renderer = new RD.Renderer(context);
  document.body.appendChild(renderer.canvas); //attach

  //PBRPipeline: NOT BEING USED NOW
  /*
	pbrpipeline = new RD.PBRPipeline( renderer );
	renderer.loadShaders("js/extra/pbr-shaders.glsl");
	pbrpipeline.bgcolor.set([2,2,2,1]); //set background and ambient color
	//pbrpipeline.loadEnvironment( "data/panorama.hdre"); //set skybox image
	renderer.pipeline = pbrpipeline;
	*/

  //create a scene
  scene = new RD.Scene();

  //get shaders from a single text file
  //renderer.loadShaders("shaders.txt");

  //folder where stuff will be loaded	(textures, meshes, shaders )
  renderer.setDataFolder("data");
  renderer.autoload_assets = true;
  //renderer.default_texture_settings.magFilter = gl.NEAREST;
  //renderer.default_texture_settings.minFilter = gl.NEAREST_MIPMAP_NEAREST;

  //create camera
  camera = new RD.Camera();
  camera.perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 1000);
  camera.lookAt([0, 40, 100], [0, 20, 0], [0, 1, 0]);

  //global settings
  var bg_color = [0.1, 0.1, 0.1, 1];

  //add some objects to the scene
  var mat = new RD.Material({ textures: { color: "girl/girl.png" } });
  mat.register("girl");

  var girl_pivot = new RD.SceneNode({
    position: [-40, 0, 0],
  });

  var girl = new RD.SceneNode({
    scaling: 0.3,
    mesh: "girl/girl.wbin",
    material: "girl",
  });
  girl.layers = CHARACTER_BIT;
  girl.flags.ignore_collisions = true;
  girl_pivot.addChild(girl);
  scene.root.addChild(girl_pivot);
  character = girl_pivot;
  girl.skeleton = skeleton;

  var debug_ball = new RD.SceneNode({
    mesh: "sphere",
    shader: "flat",
    scale: 1,
    color: [1, 1, 0, 1],
  });
  debug_ball.layers = DEBUG_BIT;
  scene.root.addChild(debug_ball);

  anim_idle = new RD.SkeletalAnimation();
  anim_idle.load("data/girl/idle.skanim");
  anim_walk = new RD.SkeletalAnimation();
  anim_walk.load("data/girl/walking.skanim");

  var room = new RD.SceneNode({ scaling: 40 });
  room.loadGLTF("data/room.gltf");
  room.layers = ROOM_BIT;
  scene.root.addChild(room);

  // main loop ***********************

  //main draw function
  context.ondraw = function () {
    gl.canvas.width = document.body.offsetWidth;
    gl.canvas.height = document.body.offsetHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var current_camera = camera;
    camera.target = character.localToGlobal([0, 8, 0]);

    //clear
    renderer.clear(bg_color);
    //render scene
    renderer.render(scene, current_camera);

    renderer.renderPoints(
      walk_area.getVertices(),
      null,
      camera,
      null,
      null,
      5,
      gl.LINES
    );
  };

  //main update
  context.onupdate = function (dt) {
    scene.update(dt);

    var ray = camera.getRay(gl.mouse.x, gl.mouse.y);
    var coll = vec3.create();
    hover_node = scene.testRay(ray, coll, 1000, ROOM_BIT, true);
    if (hover_node) {
      debug_ball.position = coll;
    }

    var ray = camera.getRay(gl.mouse.x, gl.mouse.y);
    var coll = vec3.create();
    hover_node = scene.testRay(ray, coll, 1000, ROOM_BIT, true);
    /*
    if (hover_node) {
      debug_ball.position = coll;
    }
	*/
    var t = getTime();
    var anim = anim_idle;
    var time_factor = 1;

    if (gl.keys["UP"]) {
      character.moveLocal([0, 0, 1]);
      character.position = walk_area.adjustPosition(character.position);
      anim = anim_walk;
    } else if (gl.keys["DOWN"]) {
      character.moveLocal([0, 0, -1]);
      anim = anim_walk;
      time_factor = -1;
    }
    if (gl.keys["LEFT"]) character.rotate(90 * DEG2RAD * dt, [0, 1, 0]);
    else if (gl.keys["RIGHT"]) character.rotate(-90 * DEG2RAD * dt, [0, 1, 0]);

    anim.assignTime(t * 0.001 * time_factor);
    girl.skeleton.copyFrom(anim.skeleton);

    anim.assignTime(0);

    var now = getTime() * 0.001;
  };

  //user input ***********************

  //detect clicks
  context.onmouseup = function (e) {
    if (e.click_time < 200) {
      //fast click
      //compute collision with floor plane
      var ray = camera.getRay(e.canvasx, e.canvasy);
      if (ray.testPlane(RD.ZERO, RD.UP)) {
        //collision
        console.log("floor position clicked", ray.collision_point);
        //walk_area.clear();
        //area_points.push(typedArrayToArray(ray.collision_point));
        //walk_area.addShape(area_points);
        debug_ball.position = ray.collision_point;
        /*
        if (walk_area.isInsideArea(ray.collision_point)) {
          debug_ball.position = ray.collision_point;
        }
		*/
      }
    }
  };

  context.onmousemove = function (e) {
    if (e.dragging) {
      //orbit camera around
      //camera.orbit( e.deltax * -0.01, RD.UP );
      //camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
      camera.moveLocal([-e.deltax * 0.1, e.deltay * 0.1, 0]);
    }
  };

  context.onmousewheel = function (e) {
    //move camera forward
    camera.moveLocal([0, 0, e.wheel < 0 ? 10 : -10]);
  };

  //capture mouse events
  context.captureMouse(true);
  context.captureKeys();

  //launch loop
  context.animate();
}

/* example of computing movement vector
	var delta = vec3.sub( vec3.create(), target, sprite.position );
	vec3.normalize(delta,delta);
	vec3.scaleAndAdd( sprite.position, sprite.position, delta, dt * 50 );
	sprite.updateMatrices();
	sprite.flags.flipX = delta[0] < 0;
*/
