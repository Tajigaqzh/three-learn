# 渲染器 Renderer

`Renderer` 负责真正绘制画面。当前示例使用的是 `WebGLRenderer`：

```ts
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
});
```

这里的配置含义是：

- `canvas`：指定绘制到页面上已有的 `canvas` 元素。
- `antialias: true`：开启抗锯齿，让边缘更平滑。

常见配置：

```ts
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x262626);
```

- `setPixelRatio` 控制高清屏渲染清晰度。限制到 `2` 可以兼顾清晰度和性能。
- `setClearColor` 设置背景色。深灰色比纯黑更容易看出物体轮廓和阴影。

如果要使用阴影，还要开启渲染器的阴影能力：

```ts
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 过期了
renderer.shadowMap.type = THREE.PCFShadowMap;
```

`PCFSoftShadowMap` 会让阴影边缘更柔和。

## 画布尺寸同步

页面中的 `canvas` 有两种尺寸：

- CSS 尺寸：页面上看起来多大。
- WebGL 绘制尺寸：内部真正绘制多少像素。

如果两者不同步，画面可能会模糊或拉伸。示例中通过下面的逻辑同步：

```ts
const width = canvas.clientWidth;
const height = canvas.clientHeight;

renderer.setSize(width, height, false);
camera.aspect = width / height;
camera.updateProjectionMatrix();
```

`setSize(width, height, false)` 的第三个参数为 `false`，表示不要让 Three.js 反过来修改 `canvas` 的 CSS 尺寸，页面布局仍然交给 CSS 控制。
