# Three.js 入门总览

Three.js 可以理解成一套在浏览器里绘制 3D 画面的工具。它最终画在页面的 `canvas` 上，但封装了 WebGL 里比较底层的细节。

一帧 3D 画面通常由这些对象共同完成：

- `Scene`：场景，3D 世界的容器。
- `Camera`：相机，决定从哪里看这个世界。
- `Renderer`：渲染器，把相机看到的画面画到 `canvas`。
- `Mesh`：物体，由几何体和材质组成。
- `Material`：材质，决定物体表面的颜色、贴图、粗糙度、金属感等。
- `Light`：光源，决定受光材质的明暗、阴影和氛围。

核心调用是：

```ts
renderer.render(scene, camera);
```

![Three.js 基础渲染流程](/images/three-pipeline.svg)

建议阅读顺序：

1. [入门](./getting-started)
2. [场景 Scene](./scene)
3. [相机 Camera](./camera)
4. [控制器 OrbitControls](./orbit-controls)
5. [渲染器 Renderer](./renderer)
6. [物体 Mesh](./mesh)
7. [材质 Material](./material)
8. [光照 Light](./light)
9. [阴影 Shadow](./shadow)
10. [三维坐标轴与辅助线](./axes-grid)
11. [渲染循环](./render-loop)
12. [资源释放](./dispose)
