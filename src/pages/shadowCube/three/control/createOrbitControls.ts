import type { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createOrbitControls(camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
  const controls = new OrbitControls(camera, canvas);

  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.8;
  controls.minDistance = 15;
  controls.maxDistance = 120;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.update();

  return controls;
}
