import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import {MapControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import {atlanta, beijing, cape, delhi, easter, florence, goiania,hobart} from './coordinates.js'






var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(-30, 40, 0);
camera.lookAt(scene.position);



var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new MapControls(camera, renderer.domElement);
controls.maxPolarAngle = 1.50;
controls.minDistance = 35;
controls.maxDistance = 200;


/// Light to see the world map
var light = new THREE.AmbientLight(0xffffff, 1);
light.position.setScalar(10);
scene.add(light);
let frame = 0;

let stars, earthImage;
let names = ["Atlanta", "Beijing", "Cape Town", "Delhi", "Easter Island", "Florence", "Goiania", "Hobart"]




//// INIT ////


// scene.add(new THREE.GridHelper(160, 160, 0x303030, 0x303030 ));


// add a Polar GRID
const wireframe = new THREE.Mesh(
	new THREE.CircleBufferGeometry(110, 32),
		 new THREE.MeshBasicMaterial({
		 color: 0xBBBBBB,
		 wireframe: true,
		 transparent: true,
		 opacity: 0.3
	})
)
var material = new THREE.LineBasicMaterial( {color: 0xBBBBBB,
	transparent: true,
	opacity: 0.40 });

for ( let amplitude = 0; amplitude<=110; amplitude+=10){
	var resolution = 90;
	var size = 360 / resolution;
	var circleVertices = [];
	for(var i = 0; i <= resolution; i++) {
		var segment = ( i * size ) * Math.PI / 180;
		circleVertices.push( new THREE.Vector3( Math.cos( segment ) * amplitude, 0, Math.sin( segment ) * amplitude ) );
	}

	var geometry = new THREE.BufferGeometry().setFromPoints(circleVertices)
	var line = new THREE.Line( geometry, material );

	// line
	line.rotation.x = -0.5 * Math.PI;
	wireframe.add(line);
}
wireframe.rotation.x = -0.5 * Math.PI;
scene.add(wireframe)


//// Let's Create a projection of the Earth onto a plane
var earthGeom = new THREE.CircleGeometry(80, 80);
var earthTexture = new THREE.TextureLoader().load('./static/img/disk.png');
var earthMaterial = new THREE.MeshLambertMaterial( { map: earthTexture } );
earthImage = new THREE.Mesh(earthGeom, earthMaterial);
earthImage.receiveShadow = true;
// rotate and position the plane
earthImage.rotation.x = -0.5 * Math.PI;
earthImage.rotation.z = -0.5 * Math.PI;

earthImage.position.set(0,-0.05,0);
// add the plane to the scene
scene.add(earthImage);

// Resize
THREEx.WindowResize(renderer, camera);
 // Stars



// DEBUG //
const gui = new dat.GUI()
const world = {
	earthMap: true,
	stars: true
}
var top = gui.addFolder('Basic Config');
var starsGUI = top.add( world, 'stars' ).name("Show Stars").listen();
starsGUI.onChange( function(value) {
	if (value) scene.add(stars)
	else scene.remove(stars)
});
var globeGUI = top.add( world, 'earthMap' ).name("Show Earth Map").listen();
globeGUI.onChange( function(value) {
	if (value) scene.add(earthImage)
	else scene.remove(earthImage)
});


function genStars(){
	const starGeometry = new THREE.BufferGeometry();
	const starMaterial = new THREE.PointsMaterial({color: 0xffffff});
	const starVerticies = [];
	for (let i = 0; i<50000; i++){
		const x = (Math.random() -0.5)*1000;
		const y =  (Math.random() -0.5)*1000;
		const z = (Math.random()-0.5)*1000;;
		if(x*x+y*y+z*z > 120000) starVerticies.push(x,y,z);
	}

	starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVerticies, 3));
	stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

}
function rotateStars(){
    stars.rotation.x+=0.0001;
	stars.rotation.y+=0.0001;
}
genStars();








function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r, y);ctx.lineTo(x+w-r, y);ctx.quadraticCurveTo(x+w, y, x+w, y+r);ctx.lineTo(x+w, y+h-r);ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);ctx.lineTo(x+r, y+h);ctx.quadraticCurveTo(x, y+h, x, y+h-r);ctx.lineTo(x, y+r);ctx.quadraticCurveTo(x, y, x+r, y);ctx.closePath(); ctx.fill(); ctx.stroke();
}

function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};

	var fontface = parameters.hasOwnProperty("fontface") ?
		parameters["fontface"] : "Arial";

	var fontsize = parameters.hasOwnProperty("fontsize") ?
		parameters["fontsize"] : 25;

	var borderThickness = parameters.hasOwnProperty("borderThickness") ?
		parameters["borderThickness"] : 4;

	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;

	// get size data (height depends only on font size)

	var metrics = context.measureText( message );
	var textWidth = metrics.width;

	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	// roundRect(context, borderThickness/2+50, borderThickness/2, textWidth + borderThickness, fontsize * 1.2 + borderThickness, 19);
	roundRect(context, borderThickness/2+65, borderThickness/2, textWidth + borderThickness, fontsize * 1.2 + borderThickness, 19);

	// 1.4 is extra height factor for text below baseline: g,j,p,q.

	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText( message, borderThickness+65, fontsize + borderThickness);

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( { map: texture} );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(5,2,300.0);
	spriteMaterial.depthTest = false;

	return sprite;
}







////////////////////



let cities = []
function createCity(i){
    var cityGeom = new THREE.ConeBufferGeometry(0.4,0.4 ,6); // 0.4 is height
    cityGeom.translate(0, 0.4 * 0.5, 0); // 0.4 is height

    var cityCone = new THREE.Mesh(cityGeom, new THREE.MeshBasicMaterial({color: "#DE1738"}));
    scene.add(cityCone);
    var cityEdgesGeom = new THREE.EdgesGeometry(cityGeom);
    var cityEdges = new THREE.LineSegments(cityEdgesGeom, new THREE.LineBasicMaterial({color: "black"}));
    cityCone.add(cityEdges);

    cityCone.name = String.fromCharCode(65+i);
    let label = makeTextSprite( cityCone.name, { fontsize: 60, borderColor: {r:225, g:0, b:0, a:1.0}, backgroundColor: {r:225, g:140, b:0, a:0.9} } );
    cityCone.add(label)
	 cityCone.position.set(truePosition[i].lat/3, 0 ,truePosition[i].lon/3)
    cities.push(cityCone)
}







/// GENERATE CITIES //

let truePosition = [atlanta,beijing, cape, delhi, easter, florence, goiania, hobart];

// Generate the TRUE distances
let trueDistance = [];
const EarthR = 6371e3;

for (let i = 0; i<truePosition.length; i++){
    trueDistance.push([])
    for(let j = 0 ; j<truePosition.length; j++){
        var φ1 = truePosition[i].lat * Math.PI/180;
        var φ2 = truePosition[j].lat * Math.PI/180;
        var Δφ = ( truePosition[j].lat-truePosition[i].lat) * Math.PI/180;
        var Δλ = ( truePosition[j].lon-truePosition[i].lon) * Math.PI/180;
        var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
               Math.cos(φ1) * Math.cos(φ2) *
               Math.sin(Δλ/2) * Math.sin(Δλ/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = EarthR * c; // in metres
        trueDistance[i].push( Math.round(d/10)/100)
    }
}


for(let i = 0; i<8; i++){
    createCity(i)
}





//////// DISTANCES ///////////


let currDistance = [];
for (let i =0; i<cities.length; i++){
    var home = cities[i].position;
    currDistance.push([])

    for(let j = 0 ; j<cities.length; j++){
        var away =  cities[j].position;
		  var d = Math.round(300*Math.sqrt((home.x - away.x)**2 +  (home.z - away.z)**2))

        currDistance[i].push( d)
    }
}


// // store the deltas
let deltaDistances = []
for (let i=0; i<currDistance.length;i++){
    deltaDistances.push([])
    for( let j = 0; j <trueDistance.length;j++){
        deltaDistances[i].push(
                currDistance[i][j] - trueDistance[i][j]
        )
    }
}
// // populate total error for the first time

function totalError(){
	var delta = 0;
	for (let i = 0; i<deltaDistances.length;i++){
		 for(let j = 0; j < deltaDistances.length; j++){
			  delta += Math.abs(deltaDistances[i][j]);
		 }
	}
	return  Math.round((delta/2));
}


document.getElementById('totalError').innerHTML = totalError().toString();









function getDistance(currIdx){

	// reformat into get distance and display distance TODO!
    document.getElementById('loc').innerHTML = "<h3>   &nbsp;&nbsp;" +names[cities[currIdx].name.charCodeAt(0)-65]+ "</h3>"

    for (let i=0; i<cities.length; i++){
		  var d = Math.round(300*Math.sqrt((cities[currIdx].position.x - cities[i].position.x)**2 +  (cities[currIdx].position.z - cities[i].position.z)**2))
		  currDistance[currIdx][i] = d;
        currDistance[i][currIdx] = d;
        deltaDistances[currIdx][i]  = currDistance[currIdx][i] - trueDistance[currIdx][i];
        deltaDistances[i][currIdx]  = currDistance[currIdx][i] - trueDistance[currIdx][i];
        document.getElementById(i.toString()).innerHTML =cities[currIdx].name+ "->"+ cities[i].name +": "+ Math.round(d).toString() + " km &nbsp; ∆: " + (Math.round(deltaDistances[i][currIdx])).toString() + " km";
		  var err = totalError();
		  document.getElementById('totalError').innerHTML = err.toString();

    }

}



////////////// CURVES //////////

let base = new THREE.Vector3();
let dest = new THREE.Vector3();
let points = [];

let curve_meshes = [];

function drawCurves(idx){
	clearCurves()
	curve_meshes = [];

	base.set(cities[idx].position.x, cities[idx].position.y,cities[idx].position.z)
	for (let i=0;i<cities.length; i++){
		if (i == idx){continue}
		dest.set(cities[i].position.x,cities[i].position.y,cities[i].position.z)
		points = []
		for (let i =0; i<=12; i++){
			let p = new THREE.Vector3().lerpVectors(base,dest,i/12);
			points.push(p);

		}
		var green = Math.abs(deltaDistances[idx][i]) < 70 ? true: false;
		curve_meshes.push(new THREE.Mesh(new THREE.TubeBufferGeometry(new THREE.CatmullRomCurve3(points),64,0.05,50,false),  new THREE.MeshBasicMaterial({color: green?0x3acabb:0xff8400})));

		// curve_meshes.push(new THREE.Mesh(new THREE.TubeBufferGeometry(new THREE.CatmullRomCurve3(points),64,0.05,50,false),  new THREE.MeshBasicMaterial({color: 0x0000cc})));

	}
	for (let i = 0; i<curve_meshes.length;i++){
		scene.add(curve_meshes[i])
	}
}

function clearCurves(){

	for (let i = 0; i<curve_meshes.length;i++){
		scene.remove(curve_meshes[i])
		curve_meshes[i].material.dispose()
		curve_meshes[i].geometry.dispose()
	}
}
//////////














/////////////////////////////







///////////
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
var pNormal = new THREE.Vector3(0, 1, 0); // plane's normal
var planeIntersect = new THREE.Vector3(); // point of intersection with the plane
var pIntersect = new THREE.Vector3(); // point of intersection with an object (plane's point)
var shift = new THREE.Vector3(0,0,0); // distance between position of an object and points of intersection with the object
var moveVector = new THREE.Vector3(0,0,0);
var isDragging = false;
var dragIdx;
var showIdx;

var solveCity;
var lines = []; // used to store the line equations for the city solution

// events
document.addEventListener("pointermove", event => {
	if (solveCity) return;

  	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (!isDragging){
        var intersects = raycaster.intersectObjects(cities);

        if (raycaster.intersectObjects(cities).length>0){
            for (let i = 0; i<cities.length;i++){if (cities[i]==intersects[0].object) {dragIdx = i; break }} // save the label to drag
            if ( !frame) getDistance(dragIdx);
            drawCurves(dragIdx)

            document.body.style.cursor =  'grab';
        }
        else{
            document.body.style.cursor =  'auto';
            dragIdx = null;
				if (showIdx) getDistance(showIdx)
            clearCurves();
        }}

    if (isDragging) {

        raycaster.ray.intersectPlane(plane, planeIntersect);
		  moveVector.addVectors(planeIntersect, shift);
		  // set borders based on mouse.x
		  // https://gamedev.stackexchange.com/questions/9395/how-do-i-restrict-the-movement-of-a-point-to-within-a-radius-of-another

			if (moveVector.x > 80){
				moveVector.x = 80
			}
			else if (moveVector.x < -80){
			moveVector.x = -80
			}
			if (moveVector.z > 80){
			moveVector.z = 80
			}
			else if (moveVector.z < -80){
				moveVector.z = -80
			}

        cities[dragIdx].position.set(moveVector.x,0,moveVector.z)
		  showIdx = dragIdx;
        if ( !frame) getDistance(dragIdx);
        drawCurves(dragIdx)

    }
});




document.addEventListener("pointerdown", () => {
	if (solveCity) return;
    var intersects = raycaster.intersectObjects(cities);
    raycaster.ray.intersectPlane(plane, planeIntersect);

      if (intersects.length > 0) {
            controls.enabled = false;
            pIntersect.copy(intersects[0].point);
            plane.setFromNormalAndCoplanarPoint(pNormal, pIntersect);
            shift.subVectors(intersects[0].object.position, intersects[0].point);
            isDragging = true;
            for (let i = 0; i<cities.length;i++){if (cities[i]==intersects[0].object) {dragIdx = i; break }} // save the label to drag
			if ( !frame) getDistance(dragIdx);
        drawCurves(dragIdx)
		  showIdx = dragIdx;
    }

} );



document.addEventListener("pointerup", () => {
	if (solveCity) return;
	isDragging = false;
	// dragObject = null;
   dragIdx = null;
	controls.enabled = true;
   clearCurves()
} );



document.getElementById("resetCamera").addEventListener("click", () => {
	camera.position.set(-30, 40, 0);
	camera.lookAt(scene.position);
	controls.reset();
});


// Solve the errors of all surrounding cities

function solveCityAnimation(){
	// while ((deltaDistances[showIdx].reduce((a,b)=> Math.abs(a)+Math.abs(b), 0)) > 10){
	var flag = false;

	for (var i = 0; i<lines.length;i++){
			// check if the cone is too close
			if (i == showIdx) continue;

			if (Math.abs( deltaDistances[showIdx][i]) < 80 ) {
				var dx = lines[i][4];
				var dz = lines[i][0]*dx+ lines[i][1];
				cities[i].position.set(dx,0,dz)
				continue;
			}
			// place it correctly

			var dx = cities[i].position.x + 0.1*(lines[i][3]) * lines[i][2];
			var dz = lines[i][0]*dx+ lines[i][1];
			cities[i].position.set(dx,0,dz)
			flag = true;
	}
	getDistance(showIdx);
	drawCurves(showIdx);

	// solveCity = false;
	if (! flag) solveCity = false;

	// get the rest of the differences and combine it for the total error

}


document.getElementById("minThisError").addEventListener("click", () => {
	// controls.enabled = false;
	// controls.enabled = true;
	if (showIdx == null) return;
	lines = [];
	// let's get the equations of the lines on which we will solve the cities;
	for (var i = 0; i<cities.length; i++){
		if (i == showIdx) {lines.push([0,0]); continue;}
		if (cities[i].position.x == cities[showIdx].position.x) { cities[i].position.x += 1}
		var slope = (cities[i].position.z - cities[showIdx].position.z)/ ((cities[i].position.x - cities[showIdx].position.x))
		var b = cities[showIdx].position.z - slope*cities[showIdx].position.x
		var side = 1;
		// get which way to move
		if (cities[i].position.x > cities[showIdx].position.x && deltaDistances[showIdx][i] > 0) side = -1;
		else if (cities[i].position.x < cities[showIdx].position.x && deltaDistances[showIdx][i] < 0) side = -1;
		// let's also standardize the moves

		var move = Math.sqrt( 1 / ( 1 + slope*slope))

		var rx = Math.sqrt( Math.pow(trueDistance[i][showIdx]/300, 2) / ((slope*slope + 1) )) // need to divide over 300 since that's how we get the distance
		if (cities[i].position.x < cities[showIdx].position.x) rx = (-1)*rx;
		rx = rx + cities[showIdx].position.x;

		lines.push([slope, b, side, move, rx])
	}
	solveCity = true;

});

document.getElementById("resetPins").addEventListener("click", () => {
	return
});


renderer.setAnimationLoop(() => {
	rotateStars()
	frame = (frame+1)%2;
	if (solveCity){
		solveCityAnimation();
	}
   renderer.render(scene, camera);

})