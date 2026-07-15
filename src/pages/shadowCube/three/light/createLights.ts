import * as THREE from 'three';

export function createLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  const shadowCameraSize = 50;

  sunLight.position.set(10, 20, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.left = -shadowCameraSize;
  sunLight.shadow.camera.right = shadowCameraSize;
  sunLight.shadow.camera.top = shadowCameraSize;
  sunLight.shadow.camera.bottom = -shadowCameraSize;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 80;

  return {
    ambientLight,
    sunLight,
  };
}
