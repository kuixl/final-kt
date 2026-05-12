(function() {
var wrapper = document.getElementById('canvas-wrapper');
var canvas = document.getElementById('three-canvas');

if (!wrapper || !canvas) return;

var W = wrapper.clientWidth || 800;
var H = 500;

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

var camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
camera.position.set(0, 1.5, 6);

var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(W, H);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

var dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Cube
var cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x7a00ff })
);
cube.position.set(-2.5, 0, 0);
scene.add(cube);

// Sphere
var sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xbf80ff })
);
sphere.position.set(0, 0, 0);
scene.add(sphere);

// Torus
var torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.7, 0.28, 16, 60),
  new THREE.MeshStandardMaterial({ color: 0x5500aa })
);
torus.position.set(2.5, 0, 0);
scene.add(torus);

// GLB model
var mixer = null;
var clock = new THREE.Clock();

var loader = new THREE.GLTFLoader();
loader.load('./models/crown.glb', function(gltf) {
  var model = gltf.scene;
  model.position.set(0, -1.2, 0);
  model.scale.set(0.008, 0.008, 0.008);
  scene.add(model);

  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();
  }
}, undefined, function(err) {
  console.log('GLB not loaded:', err);
});

window.addEventListener('resize', function() {
  var w = wrapper.clientWidth || 800;
  renderer.setSize(w, H);
  camera.aspect = w / H;
  camera.updateProjectionMatrix();
});

function animate() {
  requestAnimationFrame(animate);
  var delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  cube.rotation.x += 0.008;
  cube.rotation.y += 0.01;
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.008;
  sphere.rotation.y += 0.006;
  controls.update();
  renderer.render(scene, camera);
}

animate();
})();
