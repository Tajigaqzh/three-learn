# Raycaster 鼠标拾取

`Raycaster` 用来检测一条射线碰到了哪些 3D 对象。
它最常见的用途是鼠标交互：

- 点击选中物体
- 悬停高亮物体
- 拖拽物体
- 判断视线前方有什么

```text
Camera
  \
   \  ray
    \
     □  Mesh
```

## Raycaster 是什么

可以把 `Raycaster` 理解成从相机发出去的一条线。
这条线穿过鼠标所在的屏幕位置，进入 3D 场景。
它碰到的物体，就是用户“点到”的物体。

Three.js 的鼠标拾取通常分三步：

1. 把鼠标坐标转成标准设备坐标。
2. 用相机和鼠标坐标生成射线。
3. 检测射线和物体是否相交。

## 鼠标坐标转换

浏览器事件里的 `clientX/clientY` 是像素坐标。
Raycaster 需要的是 `-1 ~ 1` 范围的标准设备坐标。

```ts
const pointer = new THREE.Vector2();

function updatePointer(event: PointerEvent) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
```

```text
屏幕坐标
左上角: (0, 0)

标准设备坐标
左上角: (-1, 1)
中心:   (0, 0)
右下角: (1, -1)
```

如果 canvas 不是全屏，不能直接用 `window.innerWidth`。
要用 canvas 的位置和尺寸：

```ts
const rect = renderer.domElement.getBoundingClientRect();

pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
```

## 点击物体

基础写法：

```ts
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener('pointerdown', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const first = intersects[0];
    console.log('picked:', first.object.name);
  }
});
```

`intersectObjects(scene.children, true)` 里的 `true` 表示递归检测子对象。
如果模型是一个 group，通常需要传 `true`。

## intersect 返回什么

`intersectObjects()` 返回一个数组，按距离从近到远排序。

常用字段：

| 字段       | 含义                   |
| ---------- | ---------------------- |
| `object`   | 被命中的对象           |
| `point`    | 命中的世界坐标         |
| `distance` | 命中点到射线起点的距离 |
| `face`     | 命中的三角面           |
| `uv`       | 命中点对应的 UV        |

示例：

```ts
const hit = intersects[0];

console.log(hit.object);
console.log(hit.point);
console.log(hit.distance);
```

## 悬停高亮

悬停高亮通常在 `pointermove` 中做。

```ts
let hovered: THREE.Mesh | null = null;

renderer.domElement.addEventListener('pointermove', (event) => {
  updatePointerFromEvent(event);
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(pickableObjects, true);

  if (hovered) {
    hovered.material.color.set(0x2196f3);
    hovered = null;
  }

  if (intersects.length > 0) {
    const object = intersects[0].object;

    if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
      hovered = object;
      hovered.material.color.set(0xffaa00);
    }
  }
});
```

实际项目里，最好保存原始颜色，恢复时不要硬编码。

## 限制可拾取对象

不要每次都对整个 `scene.children` 做检测。
更推荐维护一个可拾取列表：

```ts
const pickableObjects: THREE.Object3D[] = [];

pickableObjects.push(cube);
pickableObjects.push(sphere);

const intersects = raycaster.intersectObjects(pickableObjects, true);
```

这样更清楚，也更省性能。

## 配合 userData

可以用 `userData` 标记业务类型：

```ts
cube.userData.type = 'selectable';
cube.userData.id = 'cube-1';
```

点击后判断：

```ts
const object = intersects[0].object;

if (object.userData.type === 'selectable') {
  console.log(object.userData.id);
}
```

## 常见问题

| 问题             | 原因                                   | 处理                                        |
| ---------------- | -------------------------------------- | ------------------------------------------- |
| 点不到物体       | 鼠标坐标转换错。                       | canvas 非全屏时用 `getBoundingClientRect()` |
| 点到的是子 mesh  | glTF 模型通常是层级结构。              | 用 `object.parent` 或往上找业务节点         |
| 透明物体也被点到 | Raycaster 看几何体，不等于看最终像素。 | 自己过滤对象                                |
| 性能差           | 检测对象太多。                         | 维护 `pickableObjects`                      |
| 只点到最近物体   | 返回数组按距离排序。                   | 遍历 `intersects` 找目标                    |

## Raycaster 不是物理碰撞

`Raycaster` 只做射线相交检测。
它不是完整的物理引擎，不会处理刚体、重力、反弹、持续碰撞。

如果要做复杂碰撞、角色控制或物理模拟，需要引入专门的物理库。
