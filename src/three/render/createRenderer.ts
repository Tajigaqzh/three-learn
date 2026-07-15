import * as THREE from 'three';

/**
 * 创建 WebGL 渲染器。
 *
 * renderer 可以理解成 Three.js 的“画笔”：
 * 它会读取 scene、camera，然后把 camera 看到的 3D 画面绘制到 canvas 上。
 */
export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    /**
     * antialias 开启抗锯齿。
     * 立方体边缘是斜线时，如果不开抗锯齿，边缘可能会有明显阶梯状锯齿。
     */
    antialias: true,

    // 指定 React 页面里已经存在的 canvas，让 Three.js 直接画在这个 canvas 上。
    canvas,
  });

  /**
   * devicePixelRatio 是设备像素比。
   * 高分屏上如果完全按 devicePixelRatio 渲染，画面更清晰，但 GPU 压力也更大。
   * Math.min(..., 2) 表示最多按 2 倍像素渲染，兼顾清晰度和性能。
   */
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  return renderer;
}

/**
 * 根据 canvas 在页面上的实际显示尺寸，更新 renderer 和 camera。
 *
 * CSS 控制的是 canvas 在页面上看起来多大；
 * renderer.setSize 控制的是 WebGL 实际绘制多少像素。
 * 两者同步后，画面才不会模糊、拉伸或比例错误。
 */
export function resizeRendererToCanvas(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
) {
  // clientWidth/clientHeight 是 canvas 元素在页面中的 CSS 像素尺寸。
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  /**
   * 第三个参数 false 表示不要让 Three.js 反过来改 canvas 的 CSS 样式尺寸。
   * 页面布局仍然交给 CSS 控制，Three.js 只更新内部绘制缓冲区大小。
   */
  renderer.setSize(width, height, false);

  // 透视相机需要知道画布宽高比，否则窗口变宽/变窄时画面会被压扁或拉伸。
  camera.aspect = width / height;

  // 修改相机参数后必须调用 updateProjectionMatrix，新的宽高比才会真正生效。
  camera.updateProjectionMatrix();
}
