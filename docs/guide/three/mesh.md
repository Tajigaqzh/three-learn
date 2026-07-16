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
