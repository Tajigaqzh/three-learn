import { describe, expect, it } from 'vitest';
import { createCubeRender } from '@/pages/basicCube/three/geometry/cube/createCubeRender';
import type { Cube } from '@/pages/basicCube/three/geometry/cube/createCube';
import type { RenderContext } from '@/pages/basicCube/three/render/createRenderLoop';

function createRenderContext(delta: number): RenderContext {
  return {
    delta,
    elapsedTime: delta,
    renderer: undefined as unknown as RenderContext['renderer'],
    scene: undefined as unknown as RenderContext['scene'],
    camera: undefined as unknown as RenderContext['camera'],
  };
}

describe('createCubeRender', () => {
  it('rotates the cube using rotation speed and frame delta', () => {
    const cube = {
      mesh: {
        rotation: {
          x: 1,
          y: 2,
          z: 3,
        },
      },
    } as unknown as Cube;

    const render = createCubeRender(cube, {
      rotationSpeed: {
        x: 0.5,
        y: 1,
        z: 1.5,
      },
    });

    render(createRenderContext(2));

    expect(cube.mesh.rotation.x).toBe(2);
    expect(cube.mesh.rotation.y).toBe(4);
    expect(cube.mesh.rotation.z).toBe(6);
  });
});
