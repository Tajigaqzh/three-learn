# 入门

Three.js 的基础流程可以拆成五步：

1. 创建场景 `Scene`。
2. 创建相机 `Camera`。
3. 创建渲染器 `Renderer`，绑定页面里的 `canvas`。
4. 创建物体 `Mesh`，加入场景。
5. 调用 `renderer.render(scene, camera)` 渲染画面。

最小结构大致是：

```ts
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas });

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);
camera.position.z = 5;

renderer.render(scene, camera);
```

当前示例里不是把这些代码都堆在一个文件，而是按职责拆成了函数，例如：

- `createScene()` 创建场景。
- `createCamera()` 创建相机。
- `createRenderer(canvas)` 创建渲染器。
- `createShadowCube()` 创建立方体。
- `createLights()` 创建灯光。
- `createRenderLoop()` 管理每一帧渲染。

后面的章节会分别解释这些对象。
