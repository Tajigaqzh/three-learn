# 物体 Mesh

Three.js 中一个能被看见的普通物体通常是 `Mesh`。`Mesh` 本身不是某一种形状，而是“几何体 + 材质”的组合。

```ts
const mesh = new THREE.Mesh(geometry, material);
```

可以这样理解：

- `Geometry` 决定形状：立方体、球体、圆柱、圆锥、平面。
- `Material` 决定外观：颜色、贴图、是否受光照影响、粗糙度、金属感。
- `Mesh` 把形状和外观合起来，变成能放进场景的物体。

![常见 Geometry 形状](/images/three-geometries.svg)

## Mesh 的基本结构

当前阴影立方体示例就是一个典型的 `Mesh`：

```ts
const geometry = new THREE.BoxGeometry(4, 4, 4);
const material = new THREE.MeshStandardMaterial({
  color: 0x2196f3,
  roughness: 0.3,
  metalness: 0.2,
});

const mesh = new THREE.Mesh(geometry, material);
```

这段代码里：

- `BoxGeometry(4, 4, 4)` 创建一个宽高深都是 `4` 的立方体形状。
- `MeshStandardMaterial(...)` 创建一个会受到光照影响的材质。
- `new THREE.Mesh(...)` 把形状和材质组合成真正的 3D 物体。

创建好后，需要加入场景：

```ts
scene.add(mesh);
```

## 立方体 BoxGeometry

`BoxGeometry` 用来创建立方体或长方体：

```ts
const geometry = new THREE.BoxGeometry(width, height, depth);
```

示例：

```ts
const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
const boxGeometry = new THREE.BoxGeometry(6, 2, 3);
```

参数含义：

- `width`：x 方向宽度。
- `height`：y 方向高度。
- `depth`：z 方向深度。

适合做盒子、墙体、地砖、建筑块、立方体示例。

## 球体 SphereGeometry

`SphereGeometry` 用来创建球体：

```ts
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
```

示例：

```ts
const sphereGeometry = new THREE.SphereGeometry(2, 32, 16);
```

参数含义：

- `radius`：球半径。
- `widthSegments`：水平方向分段数。
- `heightSegments`：垂直方向分段数。

分段数越高，球越圆滑，但顶点数量也越多，渲染成本更高。

适合做星球、球形按钮、弹珠、灯泡、粒子替代物。

## 圆柱 CylinderGeometry

`CylinderGeometry` 用来创建圆柱，也可以创建上下半径不同的柱体：

```ts
const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
```

示例：

```ts
const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 6, 32);
```

参数含义：

- `radiusTop`：顶部半径。
- `radiusBottom`：底部半径。
- `height`：高度。
- `radialSegments`：圆周分段数。

适合做柱子、管道、轮子、圆形平台、瓶身。

## 圆锥 ConeGeometry

`ConeGeometry` 用来创建圆锥：

```ts
const geometry = new THREE.ConeGeometry(radius, height, radialSegments);
```

示例：

```ts
const coneGeometry = new THREE.ConeGeometry(2, 5, 32);
```

参数含义：

- `radius`：底面半径。
- `height`：高度。
- `radialSegments`：圆周分段数。

适合做尖塔、箭头、路锥、树冠、指示器。

## 平面 PlaneGeometry

`PlaneGeometry` 用来创建一个平面：

```ts
const geometry = new THREE.PlaneGeometry(width, height);
```

当前地面示例就是平面：

```ts
const geometry = new THREE.PlaneGeometry(1000, 1000);
const mesh = new THREE.Mesh(geometry, material);

mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
```

注意：`PlaneGeometry` 默认竖在 x/y 平面上。如果要作为地面，需要绕 x 轴旋转：

```ts
mesh.rotation.x = -Math.PI / 2;
```

适合做地面、墙面、图片面板、海报、背景板、投影接收面。

## 常见几何体对照

| 几何体             | 形状            | 常见用途             |
| ------------------ | --------------- | -------------------- |
| `BoxGeometry`      | 立方体 / 长方体 | 盒子、墙、建筑块     |
| `SphereGeometry`   | 球体            | 星球、珠子、灯泡     |
| `CylinderGeometry` | 圆柱            | 柱子、管道、轮子     |
| `ConeGeometry`     | 圆锥            | 尖塔、箭头、路锥     |
| `PlaneGeometry`    | 平面            | 地面、墙面、图片面板 |
| `TorusGeometry`    | 圆环            | 轮胎、圆环装饰       |

## 自定义图形 BufferGeometry

内置几何体不够用时，就要自己提供顶点数据。
Three.js 里自定义图形通常用 `BufferGeometry`。

最小的自定义图形是一个三角形：

```ts
const geometry = new THREE.BufferGeometry();

const vertices = new Float32Array([
  0,
  1,
  0, // 顶点 0
  -1,
  -1,
  0, // 顶点 1
  1,
  -1,
  0, // 顶点 2
]);

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

const material = new THREE.MeshBasicMaterial({
  color: 0x2196f3,
  side: THREE.DoubleSide,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

这里最关键的是这一行：

```ts
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
```

含义是：

- `position`：告诉 Three.js 这组数据是顶点坐标。
- `vertices`：真正的顶点数组。
- `3`：每 3 个数字组成一个顶点，也就是 `x, y, z`。

```text
Float32Array
[0, 1, 0, -1, -1, 0, 1, -1, 0]

按 3 个一组解释
v0 = ( 0,  1, 0)
v1 = (-1, -1, 0)
v2 = ( 1, -1, 0)
```

`BufferGeometry` 不关心这些点“像不像三角形”。
它只按顺序把每 3 个顶点组成一个三角面。

```text
v0
 ▲
 │\
 │ \
 │  \
v1───v2
```

## 为什么用 Float32Array

顶点坐标最终要交给 GPU。
GPU 更适合读取连续、类型明确的二进制数据，而不是普通 JavaScript 数组。

```ts
const vertices = new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]);
```

`Float32Array` 的特点是：

- 每个数字是 32 位浮点数。
- 内存连续，适合传给 WebGL。
- 类型固定，不能混入字符串、对象或其他类型。

普通数组也能先写出来，但传给 `BufferAttribute` 时最好明确转成 `Float32Array`：

```ts
const vertices = [0, 1, 0, -1, -1, 0, 1, -1, 0];
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
```

`Float32BufferAttribute` 是 Three.js 提供的简写，它会帮你创建合适的 buffer attribute。

## 用索引复用顶点

如果两个三角形拼成一个正方形，不使用索引时，需要写 6 个顶点：

```ts
const vertices = new Float32Array([
  -1, 1, 0, -1, -1, 0, 1, -1, 0,

  -1, 1, 0, 1, -1, 0, 1, 1, 0,
]);
```

这里左上角和右下角各写了两次。
更常见的写法是只写 4 个顶点，再用索引指定三角形怎么连：

```ts
const geometry = new THREE.BufferGeometry();

const vertices = new Float32Array([
  -1,
  1,
  0, // 0 左上
  -1,
  -1,
  0, // 1 左下
  1,
  -1,
  0, // 2 右下
  1,
  1,
  0, // 3 右上
]);

const indices = new Uint16Array([
  0,
  1,
  2, // 第一个三角形
  0,
  2,
  3, // 第二个三角形
]);

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
```

```text
0────3
│   /│
│  / │
│ /  │
1────2

三角形 1: 0 -> 1 -> 2
三角形 2: 0 -> 2 -> 3
```

索引用 `Uint16Array` 或 `Uint32Array`：

| 类型          | 最大索引范围 | 适合场景             |
| ------------- | ------------ | -------------------- |
| `Uint16Array` | 0 到 65535   | 顶点数量不超过 65536 |
| `Uint32Array` | 更大         | 顶点很多的大模型     |

## 给自定义图形加 UV

如果自定义几何体要贴图，还要提供 `uv`。
UV 是二维坐标，范围通常是 `0 ~ 1`。

```ts
const uvs = new Float32Array([
  0,
  1, // 顶点 0
  0,
  0, // 顶点 1
  1,
  0, // 顶点 2
  1,
  1, // 顶点 3
]);

geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
```

这里的 `2` 表示每 2 个数字组成一个 UV 坐标，也就是 `u, v`。

```text
UV 空间
(0,1)────(1,1)
  │        │
  │        │
(0,0)────(1,0)
```

如果没有 `uv`，`material.map` 这类纹理就不知道怎么贴到表面上。

## 法线 normal

如果使用 `MeshStandardMaterial`、`MeshLambertMaterial`、`MeshPhongMaterial` 这类受光照影响的材质，还需要法线。

法线表示表面朝向：

```text
      normal
        ↑
        │
表面 ───┼───
```

简单平面可以手写法线：

```ts
const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
```

也可以让 Three.js 根据三角形自动计算：

```ts
geometry.computeVertexNormals();
```

如果你发现自定义模型在光照下很黑、明暗不对，先检查有没有 `normal`。

## Mesh 的位置、旋转和缩放

`Mesh` 继承自 `Object3D`，所以可以控制位置、旋转和缩放：

```ts
mesh.position.set(0, 0, 0);
mesh.rotation.y += 0.01;
mesh.scale.set(1, 1, 1);
```

含义：

- `position`：物体在世界坐标中的位置。
- `rotation`：物体绕 x/y/z 轴旋转的角度，单位是弧度。
- `scale`：物体缩放比例。

如果物体有动画，通常会在每一帧修改这些属性，然后重新渲染。

## Mesh 常用配置

`Mesh` 继承自 `Object3D`，所以常用配置不只包括 `geometry` 和 `material`。

| 属性 / 方法     | 作用                             | 常见写法                         |
| --------------- | -------------------------------- | -------------------------------- |
| `position`      | 控制物体位置。                   | `mesh.position.set(0, 2, 0);`    |
| `rotation`      | 控制物体旋转，单位是弧度。       | `mesh.rotation.y = Math.PI / 2;` |
| `scale`         | 控制物体缩放。                   | `mesh.scale.set(2, 1, 2);`       |
| `visible`       | 控制是否显示。                   | `mesh.visible = false;`          |
| `name`          | 给物体命名，方便调试和查找。     | `mesh.name = 'player';`          |
| `castShadow`    | 是否投射阴影。                   | `mesh.castShadow = true;`        |
| `receiveShadow` | 是否接收阴影。                   | `mesh.receiveShadow = true;`     |
| `material`      | 当前材质，可运行时替换。         | `mesh.material = newMaterial;`   |
| `geometry`      | 当前几何体，可运行时替换。       | `mesh.geometry = newGeometry;`   |
| `userData`      | 挂载自定义业务数据。             | `mesh.userData.type = 'enemy';`  |
| `renderOrder`   | 控制渲染顺序。                   | `mesh.renderOrder = 10;`         |
| `frustumCulled` | 是否启用视锥裁剪。               | `mesh.frustumCulled = false;`    |
| `layers`        | 控制相机、光线投射等分层可见性。 | `mesh.layers.set(1);`            |
| `add()`         | 给当前物体添加子物体。           | `mesh.add(childMesh);`           |
| `remove()`      | 移除子物体。                     | `mesh.remove(childMesh);`        |
| `traverse()`    | 遍历自己和所有子物体。           | `mesh.traverse((obj) => {});`    |
| `lookAt()`      | 让物体朝向某个点。               | `mesh.lookAt(0, 0, 0);`          |

常见用法示例：

```ts
mesh.name = 'ground';
mesh.position.set(0, -1, 0);
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
mesh.userData.kind = 'floor';
```

需要注意：

- `visible = false` 会隐藏物体和它的子物体。
- `renderOrder` 主要用于透明物体、UI 面板等特殊排序场景，不建议到处设置。
- `frustumCulled = false` 会让物体即使在相机视野外也参与渲染判断，通常只在特殊对象上用。
- `userData` 适合放业务标记，不适合放复杂逻辑。

## Mesh 和光照的关系

严格来说，是否受光照影响不是由 `Mesh` 决定的，而是由 `Material` 决定的。

同一个 `BoxGeometry`，换不同材质，表现会完全不同：

```ts
const geometry = new THREE.BoxGeometry(4, 4, 4);

const basicMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x2196f3 }));

const standardMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x2196f3 }));
```

它们的区别是：

| 材质                   | 是否受光照影响 | 是否能看出明暗面 |
| ---------------------- | -------------- | ---------------- |
| `MeshBasicMaterial`    | 否             | 否               |
| `MeshStandardMaterial` | 是             | 是               |
| `MeshLambertMaterial`  | 是             | 是，偏柔和       |
| `MeshPhongMaterial`    | 是             | 是，有高光       |

所以“物体会不会被灯光照亮”，要看它用的材质。如果使用 `MeshBasicMaterial`，即使场景里有 `DirectionalLight`，物体颜色也不会因为光照方向发生变化。

## Mesh 和阴影

阴影能力也配置在 `Mesh` 上：

```ts
mesh.castShadow = true;
mesh.receiveShadow = true;
```

- `castShadow`：这个物体是否投射阴影。
- `receiveShadow`：这个物体是否接收阴影。

立方体通常需要投射阴影：

```ts
cube.mesh.castShadow = true;
```

地面通常需要接收阴影：

```ts
ground.mesh.receiveShadow = true;
```

阴影还要求渲染器和光源也开启阴影，具体见 [阴影 Shadow](./shadow)。

## 资源释放

几何体和材质会占用 GPU 资源。物体不再使用时，需要释放：

```ts
geometry.dispose();
material.dispose();
```

如果材质里有贴图，也要释放贴图：

```ts
texture.dispose();
```
