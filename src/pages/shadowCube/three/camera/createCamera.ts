import { PerspectiveCamera } from 'three';

export function createCamera() {
  const camera = new PerspectiveCamera(80, 1, 0.1, 200);

  camera.position.set(30, 30, 30);
  camera.lookAt(0, 0, 0);

  return camera;
}
