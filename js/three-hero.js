/* nichive - Three.js hero: textured .glb fully framed, rotates on scroll + drag + idle.
   Home page (Object N°03 - Tabi). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const mount = document.querySelector('#hero-3d');
if (mount) {
  const loader_el = mount.querySelector('.viewer__loader');
  const w = () => mount.clientWidth, h = () => mount.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, w()/h(), 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(w(), h());
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3,5,4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.8); fill.position.set(-4,1,-2); scene.add(fill);

  // pivot so rotation is always around the model's true centre
  const pivot = new THREE.Group();
  scene.add(pivot);
  let ready = false;

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load('models/tabi.glb', (gltf) => {
    const model = gltf.scene;
    // centre geometry inside pivot
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(center);
    pivot.add(model);

    // frame camera so the WHOLE model fits with padding
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const r = sphere.radius;
    const fov = camera.fov * Math.PI/180;
    const dist = (r / Math.sin(fov/2)) * 1.25;   // padding
    camera.position.set(0, r*0.15, dist);
    camera.near = dist/100; camera.far = dist*10; camera.updateProjectionMatrix();
    camera.lookAt(0,0,0);
    ready = true;
    if (loader_el) loader_el.style.display = 'none';
  }, (xhr)=>{ if (loader_el && xhr.total) loader_el.textContent = 'LOADING 3D - ' + Math.round(xhr.loaded/xhr.total*100) + '%'; },
     ()=>{ if (loader_el) loader_el.textContent='3D MODEL UNAVAILABLE'; });

  // scroll-driven rotation
  let scrollRot = 0;
  addEventListener('scroll', () => { scrollRot = scrollY * 0.002; }, { passive:true });
  // drag
  let dragging=false, px=0, dragRot=0;
  renderer.domElement.addEventListener('pointerdown', e=>{dragging=true;px=e.clientX;});
  addEventListener('pointerup', ()=>dragging=false);
  addEventListener('pointermove', e=>{ if(dragging){ dragRot += (e.clientX-px)*0.01; px=e.clientX; }});

  const clock = new THREE.Clock();
  (function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (ready){
      pivot.rotation.y = scrollRot + dragRot + t*0.15;
      pivot.position.y = Math.sin(t*0.6)*0.04;
    }
    renderer.render(scene, camera);
  })();

  addEventListener('resize', ()=>{ camera.aspect=w()/h(); camera.updateProjectionMatrix(); renderer.setSize(w(),h()); });
}
