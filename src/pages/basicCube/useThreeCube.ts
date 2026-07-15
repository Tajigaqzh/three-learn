import { type RefObject, useEffect } from 'react';
import { createCamera } from './three/camera/createCamera';
import { createCube } from './three/geometry/cube/createCube';
import { createCubeRender } from './three/geometry/cube/createCubeRender';
import { createRenderLoop } from './three/render/createRenderLoop';
import { createRenderer, resizeRendererToCanvas } from './three/render/createRenderer';
import { createScene } from './three/scene/createScene';
import { createAxesHelper, createGridHelper } from './three/helper/createAxesHelper.ts';

/**
 * 把 Three.js 的初始化、动画循环和销毁逻辑封装成一个 React Hook。
 *
 * React 负责页面结构，Three.js 负责直接操作 canvas 画布。
 * 这个 Hook 的职责是：等 canvas DOM 创建好之后，再把 Three.js 的
 * renderer、scene、camera、mesh 等对象连接起来。
 */
export function useThreeCube(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;

    // React 首次渲染前 ref 可能还是 null。没有 canvas 时不能创建 WebGLRenderer。
    if (!canvas) return;

    // renderer：渲染器，负责把 Three.js 场景画到 canvas 上。
    const renderer = createRenderer(canvas);

    // scene：场景，可以理解成 3D 世界的容器，物体、灯光等都要放进场景里。
    const scene = createScene();

    // camera：相机，决定我们从哪个位置、哪个角度观察 3D 世界。
    const camera = createCamera();

    // cube：这里返回的不只是 mesh，还包含 dispose 方法，方便卸载时释放 GPU 资源。
    const cube = createCube();

    /**
     * renderTasks：每一帧渲染前要执行的任务列表。
     *
     * orderNumber 是执行顺序号，数字越小越先执行。
     * 如果多个任务的 orderNumber 一样，会继续保持它们在数组里的原始顺序。
     *
     * 以后如果要加更多动画，比如“先更新物体位置，再更新相机跟随，再渲染画面”，
     * 就可以通过 orderNumber 明确它们的先后关系。
     */
    const renderTasks = [
      {
        orderNumber: 1,
        run: createCubeRender(cube, {
          rotationSpeed: {
            x: 0.8,
            y: 0.8,
          },
        }),
      },
    ];

    const axesHelper = createAxesHelper();

    scene.add(axesHelper);

    scene.add(createGridHelper());

    // mesh 是 Three.js 中真正能被渲染出来的 3D 对象，需要添加到 scene 里。
    scene.add(cube.mesh);

    /**
     * 浏览器窗口尺寸变化后，canvas 的 CSS 尺寸可能也会变化。
     * 这里同步更新 renderer 的绘制尺寸和 camera 的宽高比，避免画面被拉伸。
     */
    const resize = () => {
      resizeRendererToCanvas(renderer, camera, canvas);
    };

    const render = createRenderLoop({
      renderer,
      scene,
      camera,
      renderTasks,
    });

    // 先执行一次 resize，确保第一帧渲染时 canvas 尺寸和相机比例就是正确的。
    resize();

    /**
     * setAnimationLoop 会让 Three.js 在每一帧调用 render。
     * 普通网页里它类似 requestAnimationFrame；在 WebXR/VR 场景里也能接管正确的帧循环。
     */
    renderer.setAnimationLoop(render);

    window.addEventListener('resize', resize);

    return () => {
      // React 组件卸载时停止监听和动画循环，避免组件销毁后还在继续渲染。
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);

      // 从场景里移除 mesh，并释放几何体、材质、渲染器持有的底层资源。
      // Three.js 对象通常会占用 GPU 资源，只靠 JavaScript 垃圾回收并不够。
      scene.remove(cube.mesh);
      cube.dispose();
      renderer.dispose();
    };
  }, [canvasRef]);
}
