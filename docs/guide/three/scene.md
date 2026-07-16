# 场景 Scene

`Scene` 是 Three.js 里的 3D 世界容器。它本身不会显示任何东西，只负责管理这个世界里有哪些对象。

可以把 `Scene` 想成一个舞台：

- `Mesh` 是舞台上的道具，比如立方体、地面。
- `Light` 是舞台灯光，比如环境光、方向光。
- `Helper` 是辅助标记，比如坐标轴、网格线。
- `Camera` 是观众或摄影机，它不一定属于舞台内容，但会从某个角度观察舞台。

![Scene 是 3D 世界容器](/images/three-scene.svg)

## 创建场景

最基础的创建方式是：

```ts
const scene = new THREE.Scene();
```

当前示例封装成：

```ts
export function createScene() {
  return new THREE.Scene();
}
```

这一步只是创建一个空世界。此时如果直接渲染，画面里不会有任何物体。

## 添加对象

创建场景后，通过 `scene.add(...)` 添加对象：

```ts
scene.add(cube.mesh);
scene.add(ground.mesh);
scene.add(lights.ambientLight);
scene.add(lights.sunLight);
```

这表示把立方体、地面、环境光和方向光放进同一个 3D 世界。

辅助线和网格线也是场景对象：

```ts
scene.add(axesHelper);
scene.add(gridHelper);
```

只要是继承自 `Object3D` 的对象，通常都可以加入场景。常见对象包括：

| 对象         | 作用           |
| ------------ | -------------- |
| `Mesh`       | 可见物体       |
| `Light`      | 光源           |
| `AxesHelper` | 坐标轴辅助线   |
| `GridHelper` | 网格辅助线     |
| `Group`      | 对多个对象分组 |

## 场景是树结构

`Scene` 不只是一个数组，它是一棵树。对象可以直接加到 `scene`，也可以先放进 `Group`，再把 `Group` 放进 `scene`。

```ts
const group = new THREE.Group();

group.add(cube.mesh);
group.add(labelMesh);
scene.add(group);
```

这样移动 `group` 时，组里的对象会一起移动。以后模型复杂起来时，分组会比把所有东西都直接加到 `scene` 更好管理。

## 移除对象

组件卸载时，如果对象不再使用，可以从场景中移除：

```ts
scene.remove(cube.mesh);
scene.remove(ground.mesh);
scene.remove(lights.sunLight);
```

`scene.remove(...)` 只是把对象从场景树中拿掉，不等于释放 GPU 资源。几何体、材质、贴图仍然需要单独 `dispose()`，这部分在 [资源释放](./dispose) 章节里讲。

## 常见误区

- 创建了 `Scene` 不代表有画面，必须添加物体并用相机渲染。
- 把对象加入 `scene` 后，仍然可能看不到，原因可能是相机没对准、物体在裁剪范围外、材质需要灯光但场景没有光。
- `Scene` 负责“有什么”，`Camera` 负责“怎么看”，`Renderer` 负责“画出来”。
