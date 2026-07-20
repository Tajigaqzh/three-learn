# Object3D 与 Group

`Object3D` 是 Three.js 场景对象的基类。
很多常见对象都继承自它：

- `Scene`
- `Mesh`
- `Camera`
- `Light`
- `Group`

所以它们都有类似的能力：位置、旋转、缩放、父子层级、显示隐藏、遍历。

## Group 是什么

`Group` 是一个空的容器对象。
它本身没有形状，也不会被看见，但可以把多个对象组织在一起。

```ts
const group = new THREE.Group();

group.add(meshA);
group.add(meshB);
scene.add(group);
```

移动 `group` 时，里面的子物体会一起移动：

```ts
group.position.set(5, 0, 0);
```

```text
Group
├─ meshA
└─ meshB
```

## 为什么要用 Group

常见用途：

- 把多个对象当成一个整体移动。
- 做父子层级动画。
- 组织复杂模型。
- 创建太阳系、车辆、机械臂这类结构。
- 给一组对象统一设置显示隐藏。

例子：月球绕地球转。

```ts
const earthGroup = new THREE.Group();
earthGroup.add(earth);
earthGroup.add(moon);

moon.position.set(6, 0, 0);
scene.add(earthGroup);

function animate() {
  earthGroup.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

月球自己的位置没有一直改，但父级 `earthGroup` 旋转了，所以月球会绕着组中心转。

## add 和 remove

添加子对象：

```ts
group.add(mesh);
```

移除子对象：

```ts
group.remove(mesh);
```

同一个对象只能有一个父级。
如果把一个 mesh 添加到新 group，它会从原来的父级中移走。

## parent 和 children

每个 `Object3D` 都有：

```ts
mesh.parent;
group.children;
```

- `parent`：当前对象的父级。
- `children`：当前对象的子级列表。

```ts
console.log(group.children.length);
console.log(mesh.parent === group);
```

## traverse 遍历

复杂模型里经常需要遍历所有子对象。

```ts
group.traverse((object) => {
  console.log(object.name);
});
```

比如给模型里所有 mesh 开启阴影：

```ts
model.traverse((object) => {
  if (object instanceof THREE.Mesh) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
});
```

## visible 显示隐藏

`visible` 可以控制对象是否显示：

```ts
group.visible = false;
```

父级隐藏后，子级也不会显示。

这适合做：

- 图层开关
- 调试对象显示隐藏
- 临时隐藏某组物体

## name 和 getObjectByName

可以给对象命名：

```ts
mesh.name = 'player';
```

然后从父级里查找：

```ts
const player = scene.getObjectByName('player');
```

小项目里这样很方便。
复杂项目里不要过度依赖名字查找，最好自己维护对象引用。

## userData

`userData` 可以挂自定义业务信息：

```ts
mesh.userData.type = 'enemy';
mesh.userData.hp = 100;
```

配合 Raycaster 时很常用：

```ts
if (picked.userData.type === 'enemy') {
  console.log('hit enemy');
}
```

注意：`userData` 适合放数据，不适合塞复杂函数逻辑。

## Object3D 常用属性

| 属性 / 方法          | 作用             |
| -------------------- | ---------------- |
| `position`           | 局部位置         |
| `rotation`           | 局部旋转         |
| `scale`              | 局部缩放         |
| `parent`             | 父对象           |
| `children`           | 子对象数组       |
| `visible`            | 是否显示         |
| `name`               | 对象名称         |
| `userData`           | 自定义数据       |
| `add()`              | 添加子对象       |
| `remove()`           | 移除子对象       |
| `traverse()`         | 遍历自己和子级   |
| `lookAt()`           | 朝向某个世界坐标 |
| `getWorldPosition()` | 获取世界位置     |
