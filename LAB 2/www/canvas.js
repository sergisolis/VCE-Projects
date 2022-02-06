const canvas_container = document.querySelector("#canvasContainer");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

var url = "img/man1-spritesheet.png";

//images container
var imgs = {};

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
var walking = [2,3,4,5,6,7,8,9];

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

    var t = performance.now();
    var i = Math.round(t) % walking.length;
    renderAnimation(ctx, imgs[Object.keys(imgs)[0]], walking, 100, 500, 5, 15, false);
    renderAnimation(ctx, imgs[Object.keys(imgs)[1]], walking, 400, 500, 5, 0, false);
    renderAnimation(ctx, imgs[Object.keys(imgs)[2]], walking, 700, 500, 5, 30, false);
    renderAnimation(ctx, imgs[Object.keys(imgs)[3]], walking, 1000, 500, 5, 0, true);
    console.log(imgs);
}

function update(dt){

}

//last stores timestamp from previous frame
var last = performance.now();

function loop()
{
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

