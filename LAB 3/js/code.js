var scene = null;
var renderer = null;
var pbrpipeline = null;
var camera = null;
var character = null;

var anim_idle = null;
var anim_walk = null;
var skeleton = new RD.Skeleton();

function init()
{
	//create the rendering context
	var context = GL.create({width: window.innerWidth, height:window.innerHeight});
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
	camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
	camera.lookAt( [0,40,100],[0,20,0],[0,1,0] );

	//global settings
	var bg_color = [0.1,0.1,0.1,1];

	//add some objects to the scene
	var mat = new RD.Material({	textures: { color: "girl/girl.png" } });
	mat.register("girl");

	var girl_pivot = new RD.SceneNode({
		position: [-40,0,0]
	});

	var girl = new RD.SceneNode({
		scaling: 0.3,
		mesh: "girl/girl.wbin",
		material: "girl"
	});
	girl_pivot.addChild(girl);
	scene.root.addChild( girl_pivot );
	character = girl;
	girl.skeleton = skeleton;

	anim_idle = new RD.SkeletalAnimation();
	anim_idle.load("data/girl/idle.skanim");
	anim_walk = new RD.SkeletalAnimation();
	anim_walk.load("data/girl/walking.skanim");

	var room = new RD.SceneNode({scaling:40});
	room.loadGLTF("data/room.gltf");
	scene.root.addChild( room );

	// main loop ***********************

	//main draw function
	context.ondraw = function(){
		gl.canvas.width = document.body.offsetWidth;
		gl.canvas.height = document.body.offsetHeight;
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		var current_camera = camera;
		camera.target = character.localToGlobal([0,80,0]);

		//clear
		renderer.clear(bg_color);
		//render scene
		renderer.render(scene,  current_camera);
	}


	var walking = [2,3,4,5,6,7,8,9];

	//main update
	context.onupdate = function(dt)
	{
		scene.update(dt);

		var t = getTime();
		var anim = anim_idle;
		var time_factor = 1;

		if(gl.keys["UP"])
		{
			character.moveLocal([0,0,1]);
			anim = anim_walk;
		}
		else if(gl.keys["DOWN"])
		{
			character.moveLocal([0,0,-1]);
			anim = anim_walk;
			time_factor = -1;
		}
		if(gl.keys["LEFT"])
			character.rotate(90*DEG2RAD*dt,[0,1,0]);
		else if(gl.keys["RIGHT"])
			character.rotate(-90*DEG2RAD*dt,[0,1,0]);

		anim.assignTime( t * 0.001 * time_factor );
		character.skeleton.copyFrom( anim.skeleton );

		anim.assignTime( 0 );

		var now = getTime() * 0.001;
	}

	//user input ***********************

	//detect clicks
	context.onmouseup = function(e)
	{
		if(e.click_time < 200) //fast click
		{
			//compute collision with floor plane
			var ray = camera.getRay(e.canvasx, e.canvasy);
			if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision
			{
				console.log( "floor position clicked", ray.collision_point );
			}
		}
	}

	context.onmousemove = function(e)
	{
		if(e.dragging)
		{
			//orbit camera around
			//camera.orbit( e.deltax * -0.01, RD.UP );
			//camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
			camera.moveLocal([-e.deltax*0.1, e.deltay*0.1,0]);
		}
	}

	context.onmousewheel = function(e)
	{
		//move camera forward
		camera.moveLocal([0,0,e.wheel < 0 ? 10 : -10] );
	}

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
