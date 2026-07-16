# 三维坐标轴与辅助线

Three.js 是三维坐标系统。理解 x、y、z 轴之后，调相机、灯光、物体位置都会容易很多。

当前示例里加入了两类辅助对象：

```ts
const axesHelper = new THREE.AxesHelper(50);
const gridHelper = new THREE.GridHelper(100, 20);

scene.add(axesHelper);
scene.add(gridHelper);
```

![三维坐标轴与网格辅助线](/images/three-axes-grid.svg)

## 三维坐标轴

Three.js 默认使用右手坐标系：

- `x` 轴：左右方向，通常红色。
- `y` 轴：上下方向，通常绿色。
- `z` 轴：前后方向，通常蓝色。

`AxesHelper` 会把这三根轴画出来：

```ts
const axesHelper = new THREE.AxesHelper(50);
```

参数 `50` 表示坐标轴长度。

有了坐标轴后，你能更直观看到：

- 物体在往哪个方向移动。
- 相机现在从哪个方向观察。
- 光源位置在物体的哪一侧。

## GridHelper 网格线

`GridHelper` 用来显示地面网格：

```ts
const gridHelper = new THREE.GridHelper(100, 20);
```

参数含义：

- `100`：网格总尺寸。
- `20`：网格分段数。

也就是说，一个 `100 x 100` 的网格会被切成 20 份。

网格线常用于：

- 判断物体是否在地面上。
- 判断相机透视和空间深度。
- 调整物体、灯光、阴影的位置。

## 坐标轴和网格不等于真实地面

`GridHelper` 只是辅助线，不会接收阴影，也不是实体地面。

如果要做真正的地面，需要 `PlaneGeometry`：

```ts
const geometry = new THREE.PlaneGeometry(3000, 3000);
const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
const mesh = new THREE.Mesh(geometry, material);

mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
```

可以这样区分：

| 对象            | 是否真实渲染为地面 | 是否接收阴影 | 作用         |
| --------------- | ------------------ | ------------ | ------------ |
| `GridHelper`    | 否                 | 否           | 辅助观察空间 |
| `PlaneGeometry` | 是                 | 可以         | 作为真实地面 |

## 为什么地面要旋转

`PlaneGeometry` 默认在 x/y 平面上，是竖着的。要让它躺在地上，需要绕 x 轴旋转 90 度：

```ts
mesh.rotation.x = -Math.PI / 2;
```

`Math.PI / 2` 是 90 度，负号表示朝另一个方向旋转。

## 调试建议

刚开始学习 Three.js 时，建议保留 `AxesHelper` 和 `GridHelper`：

- 先用辅助线确认方向。
- 再调相机位置。
- 再调灯光位置。
- 最后如果不想显示辅助线，再移除它们。

## 其他常见 Helper

除了 `AxesHelper` 和 `GridHelper`，Three.js 里还有很多辅助对象。它们通常只用于调试，不是最终画面必须保留的内容。

### DirectionalLightHelper

方向光的位置和方向不容易直接看出来，可以用 `DirectionalLightHelper` 辅助观察：

```ts
const helper = new THREE.DirectionalLightHelper(sunLight, 5);

scene.add(helper);
```

它可以帮助你判断太阳光从哪里照过来。

### CameraHelper

阴影问题经常和光源的 shadow camera 范围有关。可以用 `CameraHelper` 显示阴影相机范围：

```ts
const helper = new THREE.CameraHelper(sunLight.shadow.camera);

scene.add(helper);
```

如果阴影被裁掉，通常能通过这个 helper 看出物体是否在 shadow camera 范围内。

### BoxHelper

`BoxHelper` 可以显示物体包围盒：

```ts
const helper = new THREE.BoxHelper(mesh, 0xffff00);

scene.add(helper);
```

它适合用来观察模型实际占用空间，尤其是导入复杂模型时。

### SkeletonHelper

如果模型有骨骼动画，可以用 `SkeletonHelper` 显示骨骼：

```ts
const helper = new THREE.SkeletonHelper(model);

scene.add(helper);
```

它常用于调试人物、动物、机械臂这类骨骼动画。

### Helper 使用建议

| Helper                   | 作用                   |
| ------------------------ | ---------------------- |
| `AxesHelper`             | 显示 x/y/z 方向        |
| `GridHelper`             | 显示地面网格           |
| `DirectionalLightHelper` | 显示方向光             |
| `CameraHelper`           | 显示相机或阴影相机范围 |
| `BoxHelper`              | 显示物体包围盒         |
| `SkeletonHelper`         | 显示骨骼结构           |

Helper 的目标是帮你调试。等场景稳定后，可以按需要保留或移除。
