# 几何体 Geometry

几何体决定物体的形状。
材质决定物体表面怎么显示，几何体决定这个表面长什么样。

```ts
const geometry = new THREE.BoxGeometry(4, 4, 4);
const material = new THREE.MeshStandardMaterial({ color: 0x2196f3 });
const mesh = new THREE.Mesh(geometry, material);
```

Three.js 现在主要使用 `BufferGeometry`。
内置的 `BoxGeometry`、`SphereGeometry`、`PlaneGeometry` 等，本质上也是准备好顶点数据的 `BufferGeometry`。

## 内置几何体

常用内置几何体：

| 几何体             | 形状         | 常见用途           |
| ------------------ | ------------ | ------------------ |
| `BoxGeometry`      | 盒子、长方体 | 立方体、墙、建筑块 |
| `SphereGeometry`   | 球体         | 星球、珠子、灯泡   |
| `PlaneGeometry`    | 平面         | 地面、墙面、图片板 |
| `CylinderGeometry` | 圆柱         | 柱子、管道、轮子   |
| `ConeGeometry`     | 圆锥         | 尖塔、箭头、树冠   |
| `TorusGeometry`    | 圆环         | 轮胎、圆环装饰     |

分段数越高，形状越圆滑，但顶点数量也越多。

```ts
const low = new THREE.SphereGeometry(2, 8, 6);
const high = new THREE.SphereGeometry(2, 64, 32);
```

## BufferGeometry 是什么

`BufferGeometry` 是直接面向 GPU 的几何体格式。
它把顶点坐标、法线、UV、颜色等数据存在连续数组里。

```text
BufferGeometry
├─ position: 顶点坐标
├─ normal:   法线方向
├─ uv:       纹理坐标
└─ index:    顶点索引
```

最小的三角形：

```ts
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
```

`3` 表示每 3 个数字是一组 `x, y, z`。

## position 顶点坐标

`position` 是必须属性。
没有 `position`，几何体就没有形状。

```ts
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
```

```text
[0, 1, 0, -1, -1, 0, 1, -1, 0]

v0 = ( 0,  1, 0)
v1 = (-1, -1, 0)
v2 = ( 1, -1, 0)
```

默认情况下，每 3 个顶点组成一个三角形。

## index 索引

索引用来复用顶点。
正方形可以由两个三角形组成。

```ts
const positions = new Float32Array([-1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0]);

const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
```

```text
0────3
│   /│
│  / │
│ /  │
1────2
```

顶点数量不超过 65536 时通常用 `Uint16Array`。
顶点更多时用 `Uint32Array`。

## uv 纹理坐标

如果几何体要贴图，就需要 UV。

```ts
const uvs = new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]);

geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
```

`2` 表示每 2 个数字是一组 `u, v`。

```text
(0,1)────(1,1)
  │        │
  │        │
(0,0)────(1,0)
```

没有 UV 时，`material.map` 不知道应该怎么贴到几何体上。

## normal 法线

法线表示表面朝向。
受光材质依赖法线计算明暗。

```ts
geometry.computeVertexNormals();
```

如果自定义几何体在光照下很黑、明暗奇怪，优先检查法线。

也可以手写法线：

```ts
const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
```

## 顶点颜色

几何体也可以给每个顶点设置颜色。

```ts
const colors = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
});
```

每 3 个数字表示一个 RGB 颜色。

## 更新几何体数据

如果运行时修改了 attribute 数组，需要告诉 Three.js 上传到 GPU：

```ts
const position = geometry.getAttribute('position');
position.needsUpdate = true;
```

如果改变了几何体范围，可能还要重新计算包围体：

```ts
geometry.computeBoundingBox();
geometry.computeBoundingSphere();
```

## 释放几何体

几何体会占用 GPU 资源。
不再使用时要释放：

```ts
geometry.dispose();
```

如果一个几何体被多个 mesh 共用，不要在其中一个 mesh 移除时直接释放共享几何体。
