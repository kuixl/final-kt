/* nichive - Three.js interactive gallery.
   Centres every model at the origin (correct orbit), frames it fully,
   lets you orbit + zoom, and switches between exhibits.
   Two scissor pairs share ONE scene, stood vertically at different angles. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const mount = document.querySelector('#gallery-3d');
if (mount) {
  // Each exhibit: list of parts. A part = file + optional rotation(rad) + offset(x).
  const EXHIBITS = [
    { name:'Maison Margiela Tabi', parts:[{file:'models/tabi.glb'}] },
    { name:'Archive Flacon',       parts:[{file:'models/perfume.glb'}] },
    { name:'Tailor Dress Form',    parts:[{file:'models/dressform.glb'}] },
    { name:'Atelier Scissors (pair)', parts:[
        {file:'models/scissors1.glb', rot:[Math.PI/2,0,0],          off:[-0.6,0,0]},
        {file:'models/scissors2.glb', rot:[Math.PI/2,0,Math.PI/5],  off:[ 0.6,0,0]},
    ]},
    { name:'Museum Pedestal',      parts:[{file:'models/pedestal.glb'}] },
  ];

  const loader_el = mount.querySelector('.viewer__loader');
  const nameEl = document.querySelector('#gallery-name');
  const w = () => mount.clientWidth, h = () => mount.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, w()/h(), 0.01, 1000);
  camera.position.set(0,0,5);

  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(w(), h());
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3,5,4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.7); fill.position.set(-4,1,-3); scene.add(fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = true;          // зум колесом / щипком
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;
  controls.target.set(0,0,0);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  let currentGroup = null, idx = 0, busy = false;

  function frame(group){
    // centre the whole group at origin, then fit camera
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
    const box2 = new THREE.Box3().setFromObject(group);
    const sphere = box2.getBoundingSphere(new THREE.Sphere());
    const r = sphere.radius || 1;
    const fov = camera.fov*Math.PI/180;
    const dist = (r/Math.sin(fov/2))*1.3;
    camera.position.set(0, r*0.1, dist);
    controls.target.set(0,0,0);
    controls.minDistance = dist*0.4;   // допускаем близкий зум
    controls.maxDistance = dist*2.2;
    controls.update();
  }

  function show(i){
    if (busy) return; busy = true;
    idx = (i + EXHIBITS.length) % EXHIBITS.length;
    const ex = EXHIBITS[idx];
    if (loader_el){ loader_el.style.display='flex'; loader_el.textContent='LOADING - '+ex.name.toUpperCase(); }
    const group = new THREE.Group();
    let loaded = 0;
    ex.parts.forEach(part=>{
      loader.load(part.file, (gltf)=>{
        const m = gltf.scene;
        if (part.rot) m.rotation.set(part.rot[0],part.rot[1],part.rot[2]);
        if (part.off) m.position.set(part.off[0],part.off[1],part.off[2]);
        group.add(m);
        if (++loaded === ex.parts.length){
          if (currentGroup) scene.remove(currentGroup);
          currentGroup = group; scene.add(group);
          frame(group);
          if (loader_el) loader_el.style.display='none';
          if (nameEl) nameEl.textContent = (idx+1)+' / '+EXHIBITS.length+' - '+ex.name;
          busy = false;
        }
      }, null, ()=>{ if(loader_el) loader_el.textContent='MODEL UNAVAILABLE'; busy=false; });
    });
  }

  document.querySelector('#gal-prev')?.addEventListener('click', ()=>show(idx-1));
  document.querySelector('#gal-next')?.addEventListener('click', ()=>show(idx+1));
  show(0);

  (function animate(){ requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); })();
  addEventListener('resize', ()=>{ camera.aspect=w()/h(); camera.updateProjectionMatrix(); renderer.setSize(w(),h()); });
}
