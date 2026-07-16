# 资源释放

Three.js 的几何体、材质、贴图和渲染器都会占用 GPU 资源。React 组件卸载时，需要手动释放。

常见清理逻辑：

```ts
renderer.setAnimationLoop(null);
scene.remove(cube.mesh);
orbitControls.dispose();
cube.dispose();
renderer.dispose();
```

物体内部也需要释放几何体和材质：

```ts
geometry.dispose();
material.dispose();
texture.dispose();
```

为什么要手动释放：

- `Geometry` 会占用 GPU buffer。
- `Material` 会占用 shader 和渲染状态。
- `Texture` 会占用 GPU 纹理内存。
- `Renderer` 持有 WebGL 上下文相关资源。

JavaScript 垃圾回收只能处理普通对象引用，不能及时释放所有 GPU 资源。页面切换、热更新或长时间运行时，如果不释放，显存占用可能越来越高。

在 React 里，这类清理通常放在 `useEffect` 的返回函数中：

```ts
useEffect(() => {
  // 初始化 Three.js

  return () => {
    // 清理 Three.js 资源
  };
}, []);
```
