import * as THREE from 'three';

/**
 * 创建透视相机。
 *
 * Three.js 里相机决定“从哪里看场景”。
 * PerspectiveCamera 是最常用的相机类型，它会模拟人眼/真实摄像机的透视效果：
 * 离相机越近的物体看起来越大，离相机越远的物体看起来越小。
 */
export function createCamera() {
  /**
   * PerspectiveCamera(fov, aspect, near, far)
   *
   * fov：视野角度，单位是度。75 表示垂直方向能看到 75 度范围。
   * aspect：宽高比。这里先写 1，后面会在 resizeRendererToCanvas 中用真实 canvas 宽高更新。
   * near：最近可见距离。小于 0.1 的物体不会被渲染。
   * far：最远可见距离。大于 5 的物体不会被渲染。
   */
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 40);

  /**
   * Three.js 默认相机和物体都在世界坐标原点 (0, 0, 0)。
   * 如果相机和立方体重合，就像眼睛贴在物体内部，通常看不到正常画面。
   * 把相机沿 z 轴往后移到 z = 2，就能从前方看到原点处的立方体。
   */
  camera.position.z = 10;
  camera.position.x = 10;
  camera.position.y = 5;
  camera.lookAt(0, 0, 0);

  return camera;
}
