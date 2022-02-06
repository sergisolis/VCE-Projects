const canvas_container = document.querySelector("#canvasContainer");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

var url = "img/man1-spritesheet.png";

//images container
var imgs = {};

var mouse_pos = [0,0];
var target_pos = [0,0];

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

function draw(){
    var parent = canvas.parentNode;
	var rect = parent.getBoundingClientRect();
	canvas.height = canvas_container.clientHeight;
    canvas.width = canvas_container.clientWidth;

    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    if(mouse_pos[0] <= target_pos[0]){
        selected_walking = walking_right;
    } else{
        selected_walking = walking_left;
    }
    renderAnimation(ctx, imgs[Object.keys(imgs)[0]], selected_walking, mouse_pos[0], mouse_pos[1], 5, 0, false);
    renderAnimation(ctx, imgs[Object.keys(imgs)[1]], walking_right, 400, 500, 5, 0, false);
    renderAnimation(ctx, imgs[Object.keys(imgs)[2]], walking_front, 700, 500, 5, 0, false);
    renderAnimation(ctx, imgs[Object.keys(imgs)[3]],  walking_right, 1000, 500, 5, 0, true);
}

function onMouse( event ) { 

   var rect = canvas.getBoundingClientRect();
   var canvasx =  event.clientX - rect.left;
   var canvasy = event.clientY - rect.top;

   if(event.type == "mousedown")
   {
        target_pos[0] = canvasx - 16*5;
        target_pos[1] = canvasy - 32*5;
   }
   else if(event.type == "mousemove")
   {

   }
   else //mouseup
   {
   }
};

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

   mouse_pos[0] = lerp( mouse_pos[0], target_pos[0], 0.01 );
   mouse_pos[1] = lerp( mouse_pos[1], target_pos[1], 0.01 );
   
   draw();
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
//start loop
loop();

document.body.addEventListener("mousedown", onMouse );
document.body.addEventListener("mousemove", onMouse );
document.body.addEventListener("mouseup", onMouse );