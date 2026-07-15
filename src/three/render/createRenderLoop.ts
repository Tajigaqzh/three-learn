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

/**
 * 每一帧里真正被执行的任务函数。
 *
 * context 里会提供 delta、elapsedTime、renderer、scene、camera，
 * 这样任务函数不需要自己再去保存这些公共对象。
 */
export type RenderTaskRunner = (context: RenderContext) => void;

/**
 * 渲染任务支持两种写法：
 *
 * 1. 直接传函数：createCubeRender(cube)
 *    这种写法的 orderNumber 默认是 0。
 *
 * 2. 传对象：{ orderNumber: 10, run: createCubeRender(cube) }
 *    orderNumber 是执行顺序号，数字越小越先执行。
 */
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

/**
 * 创建渲染循环。
 *
 * Three.js 的动画不是“渲染一次就结束”，而是浏览器每一帧都要：
 * 1. 更新计时器，算出这一帧和上一帧之间经过了多久。
 * 2. 按顺序执行动画/交互任务。
 * 3. 调用 renderer.render(scene, camera) 把最新状态画出来。
 */
export function createRenderLoop({
  renderer,
  scene,
  camera,
  renderTasks = [],
}: CreateRenderLoopParams) {
  /**
   * Timer 是 Three.js 推荐用来替代 Clock 的计时器。
   * 它能提供 delta 和 elapsedTime：
   * delta：上一帧到当前帧经过了多少秒，常用于计算动画速度。
   * elapsedTime：动画循环开始后累计经过了多少秒，常用于周期动画。
   */
  const timer = new THREE.Timer();

  /**
   * 任务排序只需要在创建渲染循环时做一次。
   * 如果放到每一帧里排序，会在动画运行时产生不必要的性能开销。
   */
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
    .sort((currentTask, nextTask) => {
      /**
       * 先按 orderNumber 从小到大排。
       * orderNumber 相同时，再按 originalIndex 排，保证同优先级任务仍然按传入顺序执行。
       */
      return (
        currentTask.orderNumber - nextTask.orderNumber ||
        currentTask.originalIndex - nextTask.originalIndex
      );
    });

  return (timestamp?: number) => {
    /**
     * setAnimationLoop 会把当前帧的 timestamp 传进来。
     * timer.update(timestamp) 后，再读取 getDelta/getElapsed，得到的时间才是当前帧的数据。
     */
    timer.update(timestamp);

    const delta = timer.getDelta();
    const elapsedTime = timer.getElapsed();
    const context = {
      delta,
      elapsedTime,
      renderer,
      scene,
      camera,
    };

    orderedRenderTasks.forEach((renderTask) => {
      renderTask.run(context);
    });

    // 所有任务执行完后再渲染，这样这一帧显示的是更新后的最新状态。
    renderer.render(scene, camera);
  };
}
