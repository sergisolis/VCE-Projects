// =========================================================================
// =========================================================================
// =========================================================================
// =========================================================================
// CANVAS
// =========================================================================
// =========================================================================
// =========================================================================
// =========================================================================

var users = [];

const canvas_container = document.querySelector("#canvasContainer");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

var url = "img/man1-spritesheet.png";

//images container
var imgs = {};

var mouse_pos = [0,0];
var target_pos = [0,0];
var scale = 3;
var sprite_width = 32;
var sprite_height = 64;

//example of images manager
function getImage(url) {
	//check if already loaded
	if(imgs[url])
		return imgs[url];


	//if no loaded, load and store
	var img = imgs[url] = new Image();
	img.src = url;
	return img;
}

for (let i = 0; i < 4; i++) {
    getImage("img/man"+ (i+1) + "-spritesheet.png");
}

var idle = [0];
var walking_right = [2,3,4,5,6,7,8,9];
var walking_front = [18,19,20,21,22,23,24,25];
var walking_left = [34,35,36,37,38,39,40,41];
var stopped = [16];

var selected_walking = walking_right;

function renderAnimation( ctx, image, anim, x, y, scale, offset, flip )
{
	offset = offset || 0;
	var t = Math.floor(performance.now() * 0.001 * 10);
	renderFrame( ctx, image, anim[ t % anim.length ] + offset, x,y,scale,flip);
}

function renderFrame(ctx, image, frame, x, y, scale, flip)
{
	var w = 32; //sprite width
	var h = 64; //sprite height
	scale = scale || 1;
	var num_hframes = image.width / w;
	var xf = (frame * w) % image.width;
	var yf = Math.floor(frame / num_hframes) * h;
	ctx.save();
	ctx.translate(x,y);
	if( flip )
	{
		ctx.translate(w*scale,0);
		ctx.scale(-1,1);
	}
	ctx.drawImage( image, xf,yf,w,h, 0,0,w*scale,h*scale );
	ctx.restore();
}

function checkdir(){
    var diff = Math.abs( mouse_pos[0] - target_pos[0] );

    if(mouse_pos[0] < target_pos[0] && diff > 20){
        selected_walking = walking_right;
    } else if(mouse_pos[0] > target_pos[0] && diff > 20) {
        selected_walking = walking_left;
    }
    else {
        selected_walking = stopped;
    }
}

function draw(){
    canvas.height = canvas_container.clientHeight;
    canvas.width = canvas_container.clientWidth;

	// borra contenido dibujado anteriormente
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    
    checkdir();
    mouse_pos[0] = lerp( mouse_pos[0], target_pos[0], 0.01 );
    mouse_pos[1] = lerp( mouse_pos[1], target_pos[1], 0.01 );
    renderAnimation(ctx, imgs[Object.keys(imgs)[0]], selected_walking, mouse_pos[0], mouse_pos[1], scale, 0, false);
    
}

function draw_other(id){

    users[id].previous_x = lerp( users[id].previous_x, users[id].position_x, 0.01 );
    users[id].previous_y = lerp( users[id].previous_y, users[id].position_y, 0.01 );
    renderAnimation(ctx, imgs[Object.keys(imgs)[0]], selected_walking, users[id].previous_x, users[id].previous_y, scale, 0, false);
}

//linear interpolation between two values
function lerp(a,b,f)
{
	return a * (1-f) + b * f;
}

function update(dt){

}

//last stores timestamp from previous frame
var last = performance.now();

function loop()
{

   draw();

   if(users.length){
        for (let i = 0; i < users.length; i++) {
            draw_other(i);
        }  
   }

   //to compute seconds since last loop
   var now = performance.now();
   //compute difference and convert to seconds
   var elapsed_time = (now - last) / 1000; 
   //store current time into last time
   last = now;

   //now we can execute our update method
   update( elapsed_time );

   //request to call loop() again before next frame
   requestAnimationFrame( loop );
}

function addUserCanvas(user){
    var userIndex = users.findIndex((obj => obj.id == user.id));
    if (userIndex == -1){   //user don't exist in the canvas
        user.previous_x = 0;
        user.previous_y = 0;
        user.position_x = user.position_x - (sprite_width / 2 * scale);
        user.position_y = user.position_y - (sprite_height / 2 * scale);
        users.push(user);
        console.log("new user in canvas with id: " + user.id);
    }
    else{       //user already exist in the canvas
        //users[userIndex].previous_x = users[userIndex].position_x;
        //users[userIndex].previous_y = users[userIndex].position_y;
        users[userIndex].position_x = user.position_x - (sprite_width / 2 * scale);
        users[userIndex].position_y = user.position_y - (sprite_height / 2 * scale);
    }
    console.log(user);
}

function deleteCanvas(user){
    users.splice(user, 1);
}

function targetPosition(canvas_x, canvas_y){
    target_pos[0] = canvas_x - (sprite_width / 2 * scale);
    target_pos[1] = canvas_y - (sprite_height / 2 * scale);
}

//start loop
loop();



