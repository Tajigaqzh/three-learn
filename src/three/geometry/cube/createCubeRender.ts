import type { Cube } from './createCube';
import type { RenderContext, RenderTaskRunner } from '@/three/render/createRenderLoop';

type CubeRenderOptions = {
  rotationSpeed?: {
    x?: number;
    y?: number;
    z?: number;
  };
};

/**
 * 创建一个“让立方体旋转”的渲染任务。
 *
 * 这个函数本身不会立刻旋转立方体，而是返回一个任务函数。
 * 真正的旋转发生在 createRenderLoop 的每一帧里。
 */
export function createCubeRender(cube: Cube, options: CubeRenderOptions = {}): RenderTaskRunner {
  /**
   * rotationSpeed 表示每秒旋转多少弧度。
   *
   * Three.js 的旋转单位是弧度，不是角度：
   * Math.PI 弧度 = 180 度
   * 0.8 弧度大约等于 45.8 度
   */
  const rotationSpeed = {
    x: options.rotationSpeed?.x ?? 0,
    y: options.rotationSpeed?.y ?? 0,
    z: options.rotationSpeed?.z ?? 0,
  };

  return ({ delta }: RenderContext) => {
    /**
     * delta 是“上一帧到这一帧经过了多少秒”。
     *
     * 用 rotationSpeed * delta，而不是每帧固定加一个值，可以让动画速度不受帧率影响：
     * 60 FPS 和 144 FPS 下，立方体每秒转过的角度仍然一致。
     */
    cube.mesh.rotation.x += rotationSpeed.x * delta;
    cube.mesh.rotation.y += rotationSpeed.y * delta;
    cube.mesh.rotation.z += rotationSpeed.z * delta;
  };
}
