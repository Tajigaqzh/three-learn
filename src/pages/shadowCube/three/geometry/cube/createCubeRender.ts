import type { RenderContext, RenderTaskRunner } from '../../render/createRenderLoop';
import type { ShadowCube } from './createShadowCube';

type CubeRenderOptions = {
  rotationSpeed?: {
    x?: number;
    y?: number;
    z?: number;
  };
};

export function createCubeRender(
  cube: ShadowCube,
  options: CubeRenderOptions = {},
): RenderTaskRunner {
  const rotationSpeed = {
    x: options.rotationSpeed?.x ?? 0,
    y: options.rotationSpeed?.y ?? 0,
    z: options.rotationSpeed?.z ?? 0,
  };

  return ({ delta }: RenderContext) => {
    cube.mesh.rotation.x += rotationSpeed.x * delta;
    cube.mesh.rotation.y += rotationSpeed.y * delta;
    cube.mesh.rotation.z += rotationSpeed.z * delta;
  };
}
