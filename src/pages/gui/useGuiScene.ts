import { type RefObject, useEffect } from 'react';
import { Timer } from 'three';
import { createCamera } from './camera/createCamera';
import { createControls } from './control/createControls';
import { createBox } from './geometry/createBox';
import { createGuiPanel } from './gui/createGuiPanel';
import { createSceneHelpers } from './helper/createSceneHelpers';
import { createLight } from './light/createLight';
import { createRenderer, resizeRendererToCanvas } from './render/createRenderer';
import { createScene } from './scene/createScene';
import { createGuiState } from './types';

export function useGuiScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const guiState = createGuiState();
    const renderer = createRenderer(canvas);
    const scene = createScene();
    const camera = createCamera();
    const controls = createControls(camera, canvas);
    const box = createBox(guiState);
    const light = createLight();
    const helpers = createSceneHelpers();
    const gui = createGuiPanel(guiState, box, helpers, light);

    // 用来计算每一帧和上一帧之间经过了多少秒。
    const timer = new Timer();
    timer.connect(document);

    scene.add(light);
    scene.add(helpers.gridHelper);
    scene.add(helpers.axesHelper);
    scene.add(box.mesh);

    const render = (timestamp?: number) => {
      timer.update(timestamp);
      const delta = timer.getDelta();
      if (guiState.autoRotate) {
        box.mesh.rotation.y += delta * 0.8;
      }
      controls.update();
      renderer.render(scene, camera);
    };

    const resize = () => {
      resizeRendererToCanvas(renderer, camera, canvas);
    };

    resize();
    window.addEventListener('resize', resize);
    renderer.setAnimationLoop(render);

    return () => {
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);
      controls.dispose();
      gui.destroy();
      box.dispose();
      helpers.dispose();
      timer.dispose();
      renderer.dispose();
    };
  }, [canvasRef]);
}
