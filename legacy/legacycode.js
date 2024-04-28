// take from here https://stemkoski.github.io/Three.js/Mouse-Tooltip.html
// Display the name of the objects 

// create a canvas element
var sprite1;
var canvas1, context1, texture1;
canvas1 = document.createElement('canvas');
context1 = canvas1.getContext('2d');
context1.font = "Bold 20px Arial";
context1.fillStyle = "rgba(0,0,0,0.95)";


// canvas contents will be used for a texture
texture1 = new THREE.Texture(canvas1) 
texture1.needsUpdate = true;

var spriteMaterial = new THREE.SpriteMaterial( { map: texture1} );

sprite1 = new THREE.Sprite( spriteMaterial );
sprite1.scale.set(15,10,1.0);
sprite1.position.set( 0, 0, 30 );
scene.add( sprite1 );	

function displayLabels(){
	context1.clearRect(0,0,640,480);
	var message = point.name;
	var metrics = context1.measureText(message);
	var width = metrics.width;
	context1.fillStyle = "rgba(0,0,0,0.95)"; // black border
	context1.fillRect( 0,0, width+8,20+8);
	context1.fillStyle = "rgba(255,255,255,0.95)"; // white filler
	context1.fillRect( 2,2, width+4,20+4 );
	context1.fillStyle = "rgba(0,0,0,1)"; // text color
	context1.fillText( message, 4,20 );
	texture1.needsUpdate = true;
}


