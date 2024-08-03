import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias:true});

  const sceneElements = [];
  function addScene(elem, fn) {
    sceneElements.push({elem, fn});
  }

  function makeScene(elem) {
    const scene = new THREE.Scene();

    const fov = 60;
    const aspect = 2;  // the canvas default
    const near = 5;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 11, 8);


    camera.lookAt(0, 0, 0);
    scene.add(camera);

   //  const controls = new TrackballControls(camera, elem);
  const controls = new OrbitControls(camera, elem);
	 controls.enablePan = false;
	 controls.enableZoom = false;
  // controls.minDistance = 1;
  // controls.maxDistance = 3;

	 controls.rotateSpeed = 0.3;
   controls.maxPolarAngle = 1.50;
   controls.mouseButtons = {
    RIGHT: THREE.MOUSE.ROTATE,
  }
    {
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, 2, 4);
      camera.add(light);
    }

    return {scene, camera, controls};
  }

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var move = new THREE.Vector2();

  var pNormal = new THREE.Vector3(0, 1, 0); // plane's normal
  var plane = new THREE.Plane(pNormal);

  var planeIntersect = new THREE.Vector3(); // point of intersection with the plane
  var pIntersect = new THREE.Vector3(); // point of intersection with an object (plane's point)
  var shift = new THREE.Vector3(0,0,0); // distance between position of an object and points of intersection with the object
  var moveVector = new THREE.Vector3(0,0,0);
  var isDragging = false;
  var dragIdx;
  var mouse_clicked = false;




  document.addEventListener("pointermove", event => {

    mouse.x = event.clientX
    mouse.y = - event.clientY

  })


document.addEventListener("pointerdown", () => {
	mouse_clicked = true;
} );


document.addEventListener("pointerup", () => {
  mouse_clicked = false;
  isDragging = false;
  dragIdx = null;
} );



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
roundRect(context, borderThickness/2+90, borderThickness/2, textWidth + borderThickness, fontsize * 1.2 + borderThickness, 19);

// 1.4 is extra height factor for text below baseline: g,j,p,q.

// text color
context.fillStyle = "rgba(0, 0, 0, 1.0)";

context.fillText( message, borderThickness+90, fontsize + borderThickness);

// canvas contents will be used for a texture
var texture = new THREE.Texture(canvas)
texture.needsUpdate = true;

var spriteMaterial = new THREE.SpriteMaterial( { map: texture} );
var sprite = new THREE.Sprite( spriteMaterial );
sprite.scale.set(5,2,300.0);
spriteMaterial.depthTest = false;

return sprite;
}



function totalError(err){
  var total = 0;
  for (var i = 0;i<err.length;i++){
    total += Math.abs(err[i]-1000)
  }

  document.getElementById('totalError').innerHTML = total.toString();
  if (total < 60){
      document.getElementById('totalErrorColor').style.color = "lightgreen";
      document.getElementById('totalErrorColor').style.textShadow = "0 0 10px greenyellow,0 0 20px darkgreen,0 0 40px darkcyan, 0 0 80px green";

  }
  else{
      document.getElementById('totalErrorColor').style.color = "white";
      document.getElementById('totalErrorColor').style.textShadow = "0 0 10px gold,0 0 20px firebrick,0 0 40px pink,0 0 80px red";

  }
}

function getDistance(cities){
    var err = [0,0,0]
    for (let i=0; i<cities.length; i++){
		  var d = Math.round(300*Math.sqrt((cities[i].position.x - cities[(i+1)%cities.length].position.x)**2 +  (cities[i].position.z - cities[(i+1)%cities.length].position.z)**2))
      err[i] = d;
        document.getElementById(i.toString()).innerHTML =cities[i].name+ "->"+ cities[(i+1)%cities.length].name +": "+ Math.round(d).toString() + " km" ;

    }
    totalError(err);

}



  const sceneInitFunctionsByName = {
    'box': (elem) => {

      const {scene, camera, controls} = makeScene(elem);

      var cities = [];
      var colors = [["#D2e459", "#344D0E"], ['#26ABFF',"#00254D"],['#FF99FF','#000000']]
      for (var i =0; i<3; i++){
        const cityGeom = new THREE.ConeBufferGeometry(0.4,0.4 ,6); // 0.4 is height
        cityGeom.translate(0, 0.4 * 0.5, 0); // 0.4 is height
        var cityCone = new THREE.Mesh(cityGeom, new THREE.MeshBasicMaterial({color: colors[i][0]}));
        scene.add(cityCone);
        var cityEdgesGeom = new THREE.EdgesGeometry(cityGeom);
        var cityEdges = new THREE.LineSegments(cityEdgesGeom, new THREE.LineBasicMaterial({color: colors[i][1]}));
        cityCone.add(cityEdges);
        cityCone.position.x = [-2.85,0,2.85][i]
        // cityCone.position.z = [-2.5,2.5][i]
        cityCone.name = String.fromCharCode(65+i);

        let label = makeTextSprite( cityCone.name, { fontsize: 40, borderColor: {r:225, g:0, b:0, a:1.0}, backgroundColor: {r:225, g:140, b:0, a:0.9} } );
        cityCone.add(label)
        cities.push(cityCone)
      }



      const gridHelper = new THREE.GridHelper( 10, 25 );
      scene.add(gridHelper)

      return (time, rect) => {
        // mesh.rotation.y = time * .1;
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        move.x = ((mouse.x - rect.left) / (rect.width))*2-1;
        move.y = -(((-mouse.y - rect.top) / rect.height)*2-1);

        raycaster.setFromCamera(move, camera);
        var intersects = raycaster.intersectObjects(cities);
        if (intersects.length>0){
          document.body.style.cursor =  'grab';
          if (mouse_clicked){

            controls.enabled = false;
            for (let i = 0; i<cities.length;i++){if (cities[i]==intersects[0].object) {dragIdx = i; break }} // save the label to drag

            raycaster.ray.intersectPlane(plane, planeIntersect);

            pIntersect.copy(intersects[0].point);
            plane.setFromNormalAndCoplanarPoint(pNormal, pIntersect);
            shift.subVectors(intersects[0].object.position, intersects[0].point);
            mouse_clicked = false;
            isDragging = true;

          }
        }
        if (isDragging){
          document.body.style.cursor =  'grab';

          raycaster.ray.intersectPlane(plane, planeIntersect);
		      moveVector.addVectors(planeIntersect, shift);

          if (moveVector.x > 5){
            moveVector.x = 5
          }
          else if (moveVector.x < -5){
          moveVector.x = -5
          }
          if (moveVector.z > 5){
          moveVector.z = 5
          }
          else if (moveVector.z < -5){
            moveVector.z = -5
          }
          cities[dragIdx].position.set(moveVector.x,0,moveVector.z)

        }
        if (!isDragging && intersects.length==0){
          document.body.style.cursor =  'auto';
          controls.enabled = true;
          isDragging = false;
        }
        getDistance(cities)


        renderer.render(scene, camera);
      };
    },



    'pyramid': (elem) => {
      const {scene, camera, controls} = makeScene(elem);
      const radius = .8;
      const widthSegments = 4;
      const heightSegments = 2;
      const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      const material = new THREE.MeshPhongMaterial({
        color: 'blue',
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return (time, rect) => {
        mesh.rotation.y = time * .1;
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
      //   controls.handleResize();
      //   controls.update();
        renderer.render(scene, camera);
      };
    },



  };



  document.querySelectorAll('[data-diagram]').forEach((elem) => {
    const sceneName = elem.dataset.diagram;
    const sceneInitFunction = sceneInitFunctionsByName[sceneName];
    const sceneRenderFunction = sceneInitFunction(elem);
    addScene(elem, sceneRenderFunction);
  });

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  const clearColor = new THREE.Color('#000');



  function render(time) {
    time *= 0.001;

    resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);
    renderer.setClearColor(clearColor, 0);
    renderer.clear(true, true);
    renderer.setScissorTest(true);

    const transform = `translateY(${window.scrollY}px)`;

    renderer.domElement.style.transform = transform;

    for (const {elem, fn} of sceneElements) {
      // get the viewport relative position of this element
      const rect = elem.getBoundingClientRect();
      const {left, right, top, bottom, width, height} = rect;

      const isOffscreen =
          bottom < 0 ||
          top > renderer.domElement.clientHeight ||
          right < 0 ||
          left > renderer.domElement.clientWidth;

      if (!isOffscreen) {
        const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        fn(time, rect);
  
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();