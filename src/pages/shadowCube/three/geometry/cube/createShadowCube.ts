import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';

export function createShadowCube() {
  const geometry = new BoxGeometry(4, 4, 4);
  const material = new MeshStandardMaterial({
    color: 0x2196f3,
    roughness: 0.3,
    metalness: 0.2,
  });
  const mesh = new Mesh(geometry, material);

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
