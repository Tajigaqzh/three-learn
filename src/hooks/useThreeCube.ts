import { type RefObject, useEffect } from 'react';
import { createCamera } from '../three/createCamera';
import { createCube } from '../three/createCube';
import { createCubeRender } from '../three/createCubeRender';
import { createRenderLoop } from '../three/createRenderLoop';
import { createRenderer, resizeRendererToCanvas } from '../three/createRenderer';
import { createScene } from '../three/createScene';

export function useThreeCube(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 创建渲染器
    const renderer = createRenderer(canvas);
    // 创建场景
    const scene = createScene();
    // 创建相机
    const camera = createCamera();
    // 创建立方体
    const cube = createCube();
    // 创建每帧执行的动效任务
    const renderTasks = [
      createCubeRender(cube, {
        rotationSpeed: {
          x: 0.8,
          y: 0.8,
        },
      }),
    ];

    scene.add(cube.mesh);

    /**
     * 窗口变化时改变画布载体
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

    resize();
    // 渲染器执行动效
    renderer.setAnimationLoop(render);

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);
      scene.remove(cube.mesh);
      cube.dispose();
      renderer.dispose();
    };
  }, [canvasRef]);
}
