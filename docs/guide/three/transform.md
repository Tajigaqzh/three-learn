# 变换 Transform

变换决定一个 3D 对象在场景里的位置、朝向和大小。
Three.js 里的 `Mesh`、`Camera`、`Light`、`Group` 都继承自 `Object3D`，所以它们都有变换属性。

最常用的是：

```ts
mesh.position.set(0, 2, 0);
mesh.rotation.y = Math.PI / 2;
mesh.scale.set(2, 1, 2);
```

## position

`position` 表示对象在父级坐标系里的位置。

```ts
mesh.position.set(x, y, z);
```

在默认坐标系里：

- x：左右方向。
- y：上下方向。
- z：前后方向。

```text
        y
        ↑
        │
        │
        └────→ x
       /
      z
```

示例：

```ts
mesh.position.set(3, 2, -5);
```

表示物体相对父级：

- 向右 3
- 向上 2
- 向前后方向移动 -5

## rotation

`rotation` 表示对象绕 x/y/z 轴旋转的角度。
Three.js 使用弧度，不是角度。

```ts
mesh.rotation.x = Math.PI / 2;
mesh.rotation.y = Math.PI;
mesh.rotation.z = 0;
```

常用换算：

| 角度   | 弧度          |
| ------ | ------------- |
| 45 度  | `Math.PI / 4` |
| 90 度  | `Math.PI / 2` |
| 180 度 | `Math.PI`     |
| 360 度 | `Math.PI * 2` |

平面作为地面时常见写法：

```ts
ground.rotation.x = -Math.PI / 2;
```

因为 `PlaneGeometry` 默认竖在 x/y 平面上，要绕 x 轴旋转后才能平躺。

## scale

`scale` 表示缩放比例。

```ts
mesh.scale.set(1, 1, 1);
```

含义：

- `1`：原始大小。
- `2`：放大到 2 倍。
- `0.5`：缩小到一半。

可以单独缩放某个方向：

```ts
mesh.scale.set(2, 1, 0.5);
```

这会让物体：

- x 方向变宽。
- y 方向不变。
- z 方向变薄。

## 局部坐标和世界坐标

`position` 默认是相对父级的局部坐标。

```ts
group.position.set(10, 0, 0);
mesh.position.set(2, 0, 0);
group.add(mesh);
```

这里 `mesh.position.x` 是 `2`，但它的世界位置 x 是 `12`。

```text
世界原点
0 ───────── 10 ── 12
            group mesh
```

常用方法：

```ts
const worldPosition = new THREE.Vector3();
mesh.getWorldPosition(worldPosition);
```

## 变换会被父级影响

父级移动、旋转、缩放，子级会一起变化。

```ts
const group = new THREE.Group();
group.add(mesh);

group.position.x = 5;
mesh.position.x = 2;
```

最终效果是：mesh 跟着 group 一起移动。

这也是为什么太阳系、车轮、机械臂这类层级结构通常会用 `Group`。

## 常用变换方法

| 方法 / 属性              | 作用             |
| ------------------------ | ---------------- |
| `position.set(x, y, z)`  | 设置位置         |
| `rotation.set(x, y, z)`  | 设置旋转         |
| `scale.set(x, y, z)`     | 设置缩放         |
| `translateX(value)`      | 沿自身 x 轴移动  |
| `translateY(value)`      | 沿自身 y 轴移动  |
| `translateZ(value)`      | 沿自身 z 轴移动  |
| `rotateX(rad)`           | 绕 x 轴旋转      |
| `rotateY(rad)`           | 绕 y 轴旋转      |
| `rotateZ(rad)`           | 绕 z 轴旋转      |
| `lookAt(x, y, z)`        | 朝向某个世界坐标 |
| `getWorldPosition(vec3)` | 获取世界坐标     |

## 矩阵更新

Three.js 底层会把 `position`、`rotation`、`scale` 合成矩阵。
一般不需要手写矩阵。

默认情况下：

```ts
mesh.matrixAutoUpdate = true;
```

所以你改了 `position`、`rotation`、`scale`，Three.js 会在渲染时自动更新矩阵。

只有做大量对象优化或手动矩阵控制时，才会考虑关闭：

```ts
mesh.matrixAutoUpdate = false;
mesh.updateMatrix();
```
