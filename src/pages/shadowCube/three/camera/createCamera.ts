import * as THREE from 'three';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

  camera.position.set(30, 30, 30);
  camera.lookAt(0, 0, 0);

  return camera;
}
