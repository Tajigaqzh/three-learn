import { type RefObject, useEffect } from 'react';
import { createCamera } from './three/camera/createCamera';
import { createOrbitControls } from './three/control/createOrbitControls';
import { createShadowCube } from './three/geometry/cube/createShadowCube';
import { createGround } from './three/geometry/ground/createGround';
import { createAxesHelper, createGridHelper } from './three/helper/createSceneHelpers';
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
    const orbitControls = createOrbitControls(camera, canvas);
    const cube = createShadowCube();
    const ground = createGround();
    const lights = createLights();
    const axesHelper = createAxesHelper();
    const gridHelper = createGridHelper();

    scene.add(lights.ambientLight);
    scene.add(lights.sunLight);
    scene.add(axesHelper);
    scene.add(gridHelper);
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
          orderNumber: 2,
          run: () => {
            orbitControls.update();
          },
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
      scene.remove(axesHelper);
      scene.remove(gridHelper);
      scene.remove(ground.mesh);
      scene.remove(cube.mesh);
      orbitControls.dispose();
      ground.dispose();
      cube.dispose();
      renderer.dispose();
    };
  }, [canvasRef]);
}
