import { type RefObject, useEffect } from 'react';
import { createCamera } from './three/camera/createCamera';
import { createShadowCube } from './three/geometry/cube/createShadowCube';
import { createCubeRender } from './three/geometry/cube/createCubeRender';
import { createGround } from './three/geometry/ground/createGround';
import { createLights } from './three/light/createLights';
import { createRenderLoop } from './three/render/createRenderLoop';
import { createRenderer, resizeRendererToCanvas } from './three/render/createRenderer';
import { createScene } from './three/scene/createScene';

export function useShadowCube(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const renderer = createRenderer(canvas);
    const scene = createScene();
    const camera = createCamera();
    const cube = createShadowCube();
    const ground = createGround();
    const lights = createLights();

    scene.add(lights.ambientLight);
    scene.add(lights.sunLight);
    scene.add(ground.mesh);
    scene.add(cube.mesh);

    const resize = () => {
      resizeRendererToCanvas(renderer, camera, canvas);
    };

    const render = createRenderLoop({
      renderer,
      scene,
      camera,
      renderTasks: [
        {
          orderNumber: 1,
          run: createCubeRender(cube, {
            rotationSpeed: {
              x: 0.25,
              y: 0.45,
            },
          }),
        },
      ],
    });

    resize();
    renderer.setAnimationLoop(render);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);

      scene.remove(lights.ambientLight);
      scene.remove(lights.sunLight);
      scene.remove(ground.mesh);
      scene.remove(cube.mesh);
      ground.dispose();
      cube.dispose();
      renderer.dispose();
    };
  }, [canvasRef]);
}
