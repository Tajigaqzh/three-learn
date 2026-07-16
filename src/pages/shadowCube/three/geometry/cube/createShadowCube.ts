import * as THREE from 'three';

export function createShadowCube() {
  const geometry = new THREE.BoxGeometry(4, 4, 4);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2196f3,
    roughness: 0.3,
    metalness: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

export type ShadowCube = ReturnType<typeof createShadowCube>;
