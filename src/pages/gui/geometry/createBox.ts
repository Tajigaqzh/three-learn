import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
import type { GuiState } from '../types';

export function createBox(guiState: GuiState) {
  const geometry = new BoxGeometry(guiState.width, guiState.height, guiState.depth);
  const material = new MeshStandardMaterial({
    color: guiState.color,
    roughness: guiState.roughness,
    metalness: guiState.metalness,
  });
  const mesh = new Mesh(geometry, material);

  return {
    geometry,
    material,
    mesh,
    updateSize: (width: number, height: number, depth: number) => {
      const oldGeometry = mesh.geometry;

      mesh.geometry = new BoxGeometry(width, height, depth);
      oldGeometry.dispose();
    },
    dispose: () => {
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}

export type GuiBox = ReturnType<typeof createBox>;
