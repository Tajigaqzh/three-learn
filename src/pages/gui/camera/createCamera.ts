import { PerspectiveCamera } from 'three';

export function createCamera() {
  const camera = new PerspectiveCamera(50, 1, 0.1, 300);

  camera.position.set(0, 0, 20);
  camera.lookAt(0, 0, 0);

  return camera;
}
