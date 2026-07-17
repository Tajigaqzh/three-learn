import { Scene } from 'three';

/**
 * 创建 Three.js 场景。
 *
 * scene 可以理解成一个 3D 世界的根容器。
 * 所有想被相机看到的物体，比如 mesh、light、helper，通常都要添加到 scene 里。
 */
export function createScene() {
  return new Scene();
}
