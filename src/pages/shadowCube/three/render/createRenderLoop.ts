import * as THREE from 'three';

type CreateRenderLoopParams = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderTasks?: RenderTask[];
};

export type RenderContext = {
  delta: number;
  elapsedTime: number;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
};

export type RenderTaskRunner = (context: RenderContext) => void;

export type RenderTask =
  | RenderTaskRunner
  | {
      orderNumber?: number;
      run: RenderTaskRunner;
    };

type OrderedRenderTask = {
  orderNumber: number;
  originalIndex: number;
  run: RenderTaskRunner;
};

export function createRenderLoop({
  renderer,
  scene,
  camera,
  renderTasks = [],
}: CreateRenderLoopParams) {
  const timer = new THREE.Timer();
  const orderedRenderTasks = renderTasks
    .map<OrderedRenderTask>((renderTask, originalIndex) => {
      if (typeof renderTask === 'function') {
        return {
          orderNumber: 0,
          originalIndex,
          run: renderTask,
        };
      }

      return {
        orderNumber: renderTask.orderNumber ?? 0,
        originalIndex,
        run: renderTask.run,
      };
    })
    .sort(
      (currentTask, nextTask) =>
        currentTask.orderNumber - nextTask.orderNumber ||
        currentTask.originalIndex - nextTask.originalIndex,
    );

  return (timestamp?: number) => {
    timer.update(timestamp);

    const delta = timer.getDelta();
    const elapsedTime = timer.getElapsed();

    orderedRenderTasks.forEach((renderTask) => {
      renderTask.run({
        delta,
        elapsedTime,
        renderer,
        scene,
        camera,
      });
    });

    renderer.render(scene, camera);
  };
}
