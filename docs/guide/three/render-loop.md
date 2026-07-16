# 渲染循环

如果只调用一次 `renderer.render(scene, camera)`，画面只会绘制一次。要做动画、控制器、实时交互，就需要每一帧都更新并重新渲染。

当前示例使用：

```ts
renderer.setAnimationLoop(render);
```

`setAnimationLoop` 在普通网页里类似 `requestAnimationFrame`，同时也兼容 WebXR 场景。

每一帧里大致做三件事：

```ts
timer.update(timestamp);

const delta = timer.getDelta();
const elapsedTime = timer.getElapsed();

renderTasks.forEach((renderTask) => {
  renderTask.run(context);
});

renderer.render(scene, camera);
```

`delta` 表示上一帧到当前帧经过的秒数。动画中使用 `delta` 可以让运动速度不直接依赖设备帧率：

```ts
mesh.rotation.y += rotationSpeed.y * delta;
```

OrbitControls 这类控制器也需要在每一帧更新：

```ts
orbitControls.update();
```

最后再渲染：

```ts
renderer.render(scene, camera);
```

这样这一帧显示的就是所有动画和交互更新后的最新状态。

如果有多个每帧任务，可以给任务设置顺序：

```ts
const renderTasks = [
  { orderNumber: 1, run: updateCube },
  { orderNumber: 2, run: updateControls },
];
```

一般顺序是：先更新物体、相机、控制器，再执行最终渲染。
