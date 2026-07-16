# 材质 Material

材质决定物体表面如何显示。它控制颜色、贴图、粗糙度、金属感，以及是否受灯光影响。

当前示例中已经用到了两类材质。

## MeshBasicMaterial

`MeshBasicMaterial` 是最简单的材质，不受光照影响：

```ts
new THREE.MeshBasicMaterial({ map: texture });
```

它的特点是：场景里没有灯光也能显示颜色和贴图。适合入门阶段、UI 标记、调试辅助对象，或者不需要真实明暗关系的物体。

基础立方体示例给每个面生成了一张 `CanvasTexture`，再贴到 `MeshBasicMaterial` 上：

```ts
const texture = new THREE.CanvasTexture(canvas);
const material = new THREE.MeshBasicMaterial({ map: texture });
```

## MeshStandardMaterial

`MeshStandardMaterial` 是更接近真实渲染的材质，会受到光照影响：

```ts
new THREE.MeshStandardMaterial({
  color: 0x2196f3,
  roughness: 0.3,
  metalness: 0.2,
});
```

常见参数：

- `color`：基础颜色。
- `roughness`：粗糙度，越高反光越散。
- `metalness`：金属度，越高越接近金属反射。

使用这类材质时，场景里通常需要添加光源。否则物体可能会很暗，甚至看不清。

## 材质和光照的关系

不是所有材质都会受灯光影响：

| 材质                   | 是否受灯光影响 | 常见用途         |
| ---------------------- | -------------- | ---------------- |
| `MeshBasicMaterial`    | 否             | 贴图、标记、调试 |
| `MeshStandardMaterial` | 是             | 常规真实感物体   |
| `MeshLambertMaterial`  | 是             | 简单漫反射       |
| `MeshPhongMaterial`    | 是             | 带高光的旧式材质 |

如果你发现灯光怎么调都不影响物体，先检查材质是不是 `MeshBasicMaterial`。
