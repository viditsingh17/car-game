import * as THREE from "https://unpkg.com/three@0.119.0/build/three.module.js";

// possible vehicle colors
const colors = [0x3498db, 0x9b59b6, 0x27ae60, 0xf1c40f, 0xf368e0];
// pick random color
const pickRandom = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// MAKING TEXTURES - using HTML canvas and
function getCarFrontTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 32);
  context.fillStyle = "#666666";
  context.fillRect(8, 8, 48, 24);

  return new THREE.CanvasTexture(canvas);
}

function getCarSideTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 128, 32);

  context.fillStyle = "#666666";
  context.fillRect(10, 8, 38, 24);
  context.fillRect(58, 8, 60, 24);

  return new THREE.CanvasTexture(canvas);
}
// line marking texture
function getLineMarkingTexture(mapWidth, mapHeight) {
  const canvas = document.createElement("canvas");
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext("2d");

  context.fillStyle = "#34495e";
  context.fillRect(0, 0, mapWidth, mapHeight);

  context.lineWidth = 2;
  context.strokeStyle = "#E0FFFF";
  context.setLineDash([10, 14]);

  // drawing the left circle
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    trackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();
  // drawing the right circle
  context.beginPath();
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    trackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();

  return new THREE.CanvasTexture(canvas);
}

// Making 3d models
//TrafficLight
function TrafficLight(x, y) {
  const trafficLight = new THREE.Group();

  // pole
  const pole = new THREE.Mesh(
    new THREE.BoxBufferGeometry(3, 3, 100),
    new THREE.MeshLambertMaterial({ color: 0xa4b0be })
  );
  pole.position.z = 50;
  pole.castShadow = true;
  pole.receiveShadow = true;
  trafficLight.add(pole);
  // body
  const body = new THREE.Mesh(
    new THREE.BoxBufferGeometry(20, 15, 60),
    new THREE.MeshLambertMaterial({ color: 0xa4b0be })
  );
  body.position.z = 117;
  body.castShadow = true;
  body.receiveShadow = true;
  trafficLight.add(body);

  // redlight
  const red = new THREE.Mesh(
    new THREE.BoxBufferGeometry(15, 22, 15),
    new THREE.MeshLambertMaterial({ color: 0xeb3b5a })
  );
  red.position.z = 136;
  trafficLight.add(red);

  // yellowlight
  const yellow = new THREE.Mesh(
    new THREE.BoxBufferGeometry(15, 22, 15),
    new THREE.MeshLambertMaterial({ color: 0xf7b731 })
  );
  yellow.position.z = 117;
  trafficLight.add(yellow);

  // greenlight
  const green = new THREE.Mesh(
    new THREE.BoxBufferGeometry(15, 22, 15),
    new THREE.MeshLambertMaterial({ color: 0x20bf6b })
  );
  green.position.z = 99;
  trafficLight.add(green);

  trafficLight.position.x = x;
  trafficLight.position.y = y;

  return trafficLight;
}
// End making 3d models
//making the islands
function getLeftIsland() {
  const leftIsland = new THREE.Shape();

  leftIsland.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle1,
    -arcAngle1,
    false
  );
  leftIsland.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI + arcAngle3,
    Math.PI - arcAngle3,
    true
  );

  return leftIsland;
}

function getRightIsland() {
  const rightIsland = new THREE.Shape();

  rightIsland.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI - arcAngle1,
    Math.PI + arcAngle1,
    true
  );
  rightIsland.absarc(
    -arcCenterX,
    0,
    outerTrackRadius,
    -arcAngle2,
    arcAngle2,
    false
  );

  return rightIsland;
}

function getCenterIsland() {
  const centerIsland = new THREE.Shape();

  centerIsland.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle3,
    -arcAngle3,
    true
  );
  centerIsland.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI + arcAngle3,
    Math.PI - arcAngle3,
    true
  );
  return centerIsland;
}

function getOuterField(mapWidth, mapHeight) {
  const field = new THREE.Shape();
  field.moveTo(-mapWidth / 2, -mapHeight / 2);
  field.lineTo(0, -mapHeight / 2);

  field.absarc(-arcCenterX, 0, outerTrackRadius, -arcAngle4, arcAngle4, true);

  field.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI - arcAngle4,
    Math.PI + arcAngle4,
    true
  );
  field.lineTo(0, -mapHeight / 2);
  field.lineTo(mapWidth / 2, -mapHeight / 2);
  field.lineTo(mapWidth / 2, mapHeight / 2);
  field.lineTo(-mapWidth / 2, mapHeight);
  return field;
}

// defining the car
function Car(isPlayerCar = false) {
  const car = new THREE.Group();

  //backWheels
  const backWheel = new THREE.Mesh(
    new THREE.BoxBufferGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  backWheel.position.z = 6;
  backWheel.position.x = -18;
  car.add(backWheel);

  // frontWheels
  const frontWheel = new THREE.Mesh(
    new THREE.BoxBufferGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  frontWheel.position.z = 6;
  frontWheel.position.x = 18;
  car.add(frontWheel);

  // body
  const body = new THREE.Mesh(
    new THREE.BoxBufferGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({
      color: isPlayerCar ? 0xd35400 : pickRandom(colors),
    })
  );
  body.position.z = 12;
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  // initialize TEXTURES
  const frontTexture = getCarFrontTexture();
  frontTexture.center = new THREE.Vector2(0.5, 0.5);
  frontTexture.rotation = Math.PI / 2;

  const backTexture = getCarFrontTexture();
  backTexture.center = new THREE.Vector2(0.5, 0.5);
  backTexture.rotation = -Math.PI / 2;

  const rightSideTexture = getCarSideTexture();

  const leftSideTexture = getCarSideTexture();
  leftSideTexture.flipY = true;

  // cabin
  const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 24, 12), [
    new THREE.MeshLambertMaterial({ map: frontTexture }),
    new THREE.MeshLambertMaterial({ map: backTexture }),
    new THREE.MeshLambertMaterial({ map: leftSideTexture }),
    new THREE.MeshLambertMaterial({ map: rightSideTexture }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
  ]);
  cabin.position.z = 25.5;
  cabin.position.x = -6;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);
  return car;
}

// Making the track
const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const arcAngle1 = Math.PI / 3;
const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const arcCenterX =
  (Math.cos(arcAngle1) * innerTrackRadius +
    Math.cos(arcAngle2) * outerTrackRadius) /
  2;

const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius);
const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius);

// render map function
function renderMap(mapWidth, mapHeight) {
  // Grey plane with line markings
  const planeGeometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight);
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: getLineMarkingTexture(mapWidth, mapHeight),
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // plane.castShadow = true;
  plane.receiveShadow = true;
  scene.add(plane);

  // Extruded geometry
  const leftIsland = getLeftIsland();
  const centerIsLand = getCenterIsland();
  const rightIsland = getRightIsland();
  const outerField = getOuterField(mapWidth, mapHeight);

  const fieldGeometry = new THREE.ExtrudeBufferGeometry(
    [leftIsland, centerIsLand, rightIsland, outerField],
    { depth: 6, bevel: false }
  );

  const fieldMesh = new THREE.Mesh(fieldGeometry, [
    new THREE.MeshLambertMaterial({ color: 0x26de81 }),
    new THREE.MeshLambertMaterial({ color: 0x20bf6b }),
  ]);
  const trafficLightYPosition = Math.sin(arcAngle1) * outerTrackRadius;
  const trafficLight1 = TrafficLight(0, trafficLightYPosition);
  const trafficLight2 = TrafficLight(0, -trafficLightYPosition);
  scene.add(trafficLight1);
  scene.add(trafficLight2);
  fieldMesh.receiveShadow = true;
  scene.add(fieldMesh);
}

// setting the scene
const scene = new THREE.Scene();
// players car
const playerCar = Car(true);
const playerInitialAngle = Math.PI;
scene.add(playerCar);

// ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(100, -300, 400);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.left = -400;
directionalLight.shadow.camera.right = 350;
directionalLight.shadow.camera.top = 400;
directionalLight.shadow.camera.bottom = -300;
directionalLight.shadow.camera.near = 100;
directionalLight.shadow.camera.far = 800;
scene.add(directionalLight);

// const aspectRatio = window.innerWidth / window.innerHeight;
const aspectRatio = 1;
const cameraWidth = 840;
const cameraHeight = cameraWidth / aspectRatio;
const camera = new THREE.OrthographicCamera(
  cameraWidth / -2, //left
  cameraWidth / 2, //right
  cameraHeight / 2, //top
  cameraHeight / -2, //bottom
  0, //near plane
  1000 //far plane
);

// Orthographic view
camera.position.set(-200, -200, 300);
// Top view
// camera.position.set(0, 0, 300);
// Side view
// camera.position.set(0, 200, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

renderMap(cameraWidth * 2, cameraHeight * 2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(window.innerWidth, window.innerWidth);
renderer.shadowMap.enabled = true;
// renderer.render(scene, camera);

//add to the HTML document
const renderDom = renderer.domElement;
document.getElementById("main").appendChild(renderDom);
renderDom.classList.add("renderer");

// GAME LOGIC STARTS HERE
let ready;
let playerAngleMoved;
let score = 0;
let distanceTravelled = 0;
const scoreElement = document.getElementById("score");
const vehiclesElement = document.getElementById("vehicles");
const travelledElement = document.getElementById("travelled");
let otherVehicles = [];
let lastTimeStamp;
const speed = 0.0017;
let accelerate = false;
let decelerate = false;

reset();

function reset() {
  // reset position and score
  playerAngleMoved = 0;
  movePlayerCar(0);
  scoreElement.innerText = score.toString();
  lastTimeStamp = undefined;
  distanceTravelled = 0;
  
  // remove end game message
  const crashElement = document.getElementById("crash-overlay");
  crashElement.style.display = "none";

  // remove other other vehicles
  otherVehicles.forEach((vehicle) => {
    scene.remove(vehicle.mesh);
  });
  otherVehicles = [];
  renderer.render(scene, camera);
  ready = true;
}

function startGame() {
  if (ready) {
    // console.log("started the game");
    ready = false;
    renderer.setAnimationLoop(animation);
  }
}

// adding the event handler
window.addEventListener("keydown", (event) => {
  // console.log(event);
  if (event.key == "ArrowUp") {
    startGame();
    accelerate = true;
    return;
  }
  if (event.key == "ArrowDown") {
    decelerate = true;
    return;
  }
  if (event.key == "R" || event.key == "r") {
    reset();
    return;
  }
});

window.addEventListener("keyup", (event) => {
  // console.log(event);
  if (event.key == "ArrowUp") {
    accelerate = false;
    return;
  }
  if (event.key == "ArrowDown") {
    decelerate = false;
    false;
    return;
  }
});

// handeling clicks
const accelerateButton = document.getElementById("accelerate");
const declerateButton = document.getElementById("declarate");
const resetButton = document.getElementById("reset");
accelerateButton.onmousedown = function () {
  startGame();
  accelerate = true;
  return;
};
declerateButton.onmousedown = function () {
  decelerate = true;
  return;
};
resetButton.onmousedown = function () {
  reset();
  return;
};
window.addEventListener("mouseup", (event) =>{
  accelerate = false;
  decelerate = false;
});
// Handle touch events
accelerateButton.ontouchstart = function () {
  startGame();
  accelerate = true;
  return;
}
accelerateButton.ontouchend = function () {
  accelerate = false;
}
declerateButton.ontouchstart =  function () {
  decelerate = true;
}
declerateButton.ontouchend = function() {
  decelerate = false;
}
resetButton.ontouchend =  function () {
  reset();
}
document.onlongpress = (event) => {}
// add other otherVehicles
function addVehicle() {
  const vehicleType = ["car"];
  const type = pickRandom(vehicleType);
  const mesh = type == "car" ? Car() : Car();
  scene.add(mesh);

  const clockwise = Math.random() >= 0.5;
  const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
  const speed = getVehicleSpeed(type);

  otherVehicles.push({ mesh, type, clockwise, angle, speed });
}

function getVehicleSpeed(type) {
  if (type == "car") {
    const minimumSpeed = 1;
    const maximumSpeed = 2;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  } else if (type == "truck") {
    const minimumSpeed = 0.6;
    const maximumSpeed = 1.5;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  }
}
// move the players car
function movePlayerCar(timeDelta) {
  const playerSpeed = getPlayerSpeed();
  playerAngleMoved -= playerSpeed * timeDelta;
  const totalPlayerAngle = playerInitialAngle + playerAngleMoved;

  const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
  const playerY = Math.sin(totalPlayerAngle) * trackRadius;

  playerCar.position.x = playerX;
  playerCar.position.y = playerY;

  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
}
//move other otherVehicles
function moveOtherVehicles(timeDelta) {
  otherVehicles.forEach((vehicle) => {
    if (vehicle.clockwise) {
      vehicle.angle -= speed * timeDelta * vehicle.speed;
    } else {
      vehicle.angle += speed * timeDelta * vehicle.speed;
    }
    const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
    const vehicleY = Math.sin(vehicle.angle) * trackRadius;

    const rotation =
      vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);
    vehicle.mesh.position.x = vehicleX;
    vehicle.mesh.position.y = vehicleY;
    vehicle.mesh.rotation.z = rotation;
  });
}

// hit detection!
function hitDetection() {
  const playerHitZone1 = getHitZonePosition(
    playerCar.position,
    playerInitialAngle + playerAngleMoved,
    true,
    15
  );
  const playerHitZone2 = getHitZonePosition(
    playerCar.position,
    playerInitialAngle + playerAngleMoved,
    true,
    -15
  );

  const hit = otherVehicles.some((vehicle) => {
    if (vehicle.type == "car") {
      const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        15
      );
      const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        -15
      );

      // the player hits another vechicle
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;

      // the player is hit by other vehicle
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    } else if (vehicle.type == "truck") {
      // TODO: handle truck hits
    }
  });

  if (hit) {
    renderer.setAnimationLoop(null); //Stop animation Loop
    displayEndScreen();
  }
}

function getHitZonePosition(center, angle, clockwise, distance) {
  const directionAngle = angle + clockwise ? -Math.PI / 2 : +Math.PI / 2;
  return {
    x: center.x + Math.cos(directionAngle) * distance,
    y: center.y + Math.sin(directionAngle) * distance,
  };
}

function getDistance(c1, c2) {
  return Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
}

// animation function - Animation Loop
function animation(timestamp) {
  // console.log("animation started");
  if (!lastTimeStamp) {
    lastTimeStamp = timestamp;
    return;
  }
  const timeDelta = timestamp - lastTimeStamp;
  movePlayerCar(timeDelta);

  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));
  distanceTravelled += (2 * Math.PI * trackRadius) / 10000;
  travelledElement.innerText = distanceTravelled.toFixed(0) + "m";
  // update the score
  if (score != laps) {
    score = laps;
    scoreElement.innerText = score;
    vehiclesElement.innerText = otherVehicles.length;
  }

  // adding other vehicles
  if (otherVehicles.length < (laps + 1) / 5) {
    addVehicle();
  }

  // animate other vehicles
  moveOtherVehicles(timeDelta);

  // hit detection !
  hitDetection();
  renderer.render(scene, camera);
  lastTimeStamp = timestamp;
}

// get the instantaneous speed of the player
function getPlayerSpeed() {
  if (accelerate) {
    return speed * 2;
  }
  if (decelerate) {
    return speed * 0.5;
  }
  return speed;
}

function rotateText() {
  let deg = 0;
  const crashedText = document.getElementById("crashed-text");
  let tiltText = setInterval(() => {
    if (deg <= -10) {
      clearInterval(tiltText);
    }
    crashedText.style.webkitTransform = "rotate(" + deg + "deg)";
    crashedText.style.mozTransform = "rotate(" + deg + "deg)";
    crashedText.style.msTransform = "rotate(" + deg + "deg)";
    crashedText.style.oTransform = "rotate(" + deg + "deg)";
    crashedText.style.transform = "rotate(" + deg + "deg)";

    deg -= 0.5;
  }, 10);
}
// display end screen overlay
function displayEndScreen() {
  const crashElement = document.getElementById("crash-overlay");
  setTimeout(() => {
    crashElement.style.display = "block";
    rotateText();
  }, 1000);
}
