# 控制器 OrbitControls

`OrbitControls` 是 Three.js examples 里最常用的相机控制器。它的作用是让用户用鼠标或触摸操作相机：拖拽旋转、滚轮缩放、围绕目标点观察。

当前阴影示例里的控制器配置是：

```ts
const controls = new OrbitControls(camera, canvas);

controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.enableZoom = true;
controls.rotateSpeed = 0.8;
controls.zoomSpeed = 0.8;
controls.minDistance = 15;
controls.maxDistance = 120;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.update();
```

![OrbitControls 参数示意图](/images/three-orbit-controls.svg)

## target：围绕哪个点观察

`target` 是控制器的观察中心。相机不是随便旋转，而是围绕这个点转。

```ts
controls.target.set(0, 0, 0);
```

当前立方体在原点附近，所以 `target` 设置为 `(0, 0, 0)`。这样拖动时，相机会围绕场景中心旋转。

如果 target 设置错了，常见表现是：

- 拖动时物体不在画面中心。
- 相机围绕一个奇怪的位置转。
- 缩放时感觉不是靠近物体，而是靠近别的点。

## minDistance / maxDistance：限制拉近拉远

这两个参数控制相机和 `target` 之间的距离范围：

```ts
controls.minDistance = 15;
controls.maxDistance = 120;
```

- `minDistance`：最多能拉多近。
- `maxDistance`：最多能拉多远。

当前阴影场景里立方体、地面和辅助线尺寸比基础立方体大，所以距离范围也比基础示例更大。

如果不限制距离，用户可能：

- 滚轮拉得太近，钻进模型内部。
- 滚轮拉得太远，场景变成一个很小的点。

## minPolarAngle / maxPolarAngle：限制上下翻转

`polarAngle` 是从 y 轴正上方往下量的角度。

```ts
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
```

角度可以这样理解：

| 值                 | 视角               |
| ------------------ | ------------------ |
| `0`                | 从正上方看向目标   |
| `Math.PI / 2`      | 水平视角           |
| 大于 `Math.PI / 2` | 相机会绕到目标下方 |

你不想拖动时看到地面以下，关键就是限制：

```ts
controls.maxPolarAngle = Math.PI / 2 - 0.05;
```

`0.05` 是一个很小的余量，避免刚好卡在水平线时出现视觉抖动或穿帮。

## enableDamping / dampingFactor：阻尼

阻尼会让相机操作带一点惯性，手感更顺：

```ts
controls.enableDamping = true;
controls.dampingFactor = 0.08;
```

开启阻尼后，必须在每一帧调用：

```ts
controls.update();
```

否则相机状态不会持续更新，阻尼效果也不会正常工作。

## enablePan：是否允许平移

```ts
controls.enablePan = false;
```

关闭平移后，用户只能围绕 `target` 旋转和缩放，不能把观察中心拖走。

这对当前示例比较合适，因为我们希望用户始终围绕立方体和地面中心观察。

## enableZoom / zoomSpeed：缩放

```ts
controls.enableZoom = true;
controls.zoomSpeed = 0.8;
```

- `enableZoom` 控制是否允许滚轮缩放。
- `zoomSpeed` 控制缩放速度。

如果缩放太快，用户容易一下穿进场景；如果太慢，操作会显得迟钝。

## rotateSpeed：旋转速度

```ts
controls.rotateSpeed = 0.8;
```

这个值控制拖拽旋转的灵敏度。数字越大，同样的鼠标移动会让相机转得越多。

## minAzimuthAngle / maxAzimuthAngle：限制左右旋转

`azimuthAngle` 是围绕 y 轴水平旋转的角度，也就是“左右转”的范围。

```ts
controls.minAzimuthAngle = -Math.PI / 4;
controls.maxAzimuthAngle = Math.PI / 4;
```

这表示用户只能在左右各 45 度范围内旋转。

它适合这些场景：

- 产品展示只允许看正面附近。
- 室内场景不希望相机穿到墙外。
- 固定展示台，只允许小范围转动。

如果不设置，默认可以绕目标点水平旋转一整圈。

## autoRotate / autoRotateSpeed：自动旋转

自动旋转会在用户不操作时让相机自己绕着目标转：

```ts
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;
```

它常用于产品展示、模型预览页。开启后同样需要每一帧调用：

```ts
controls.update();
```

否则自动旋转不会生效。

## panSpeed：平移速度

如果允许平移，可以通过 `panSpeed` 调整平移速度：

```ts
controls.enablePan = true;
controls.panSpeed = 0.6;
```

平移不是旋转相机，而是移动 `target` 和相机位置。也就是说，整个观察中心会被拖走。

对学习示例来说，通常会关闭平移：

```ts
controls.enablePan = false;
```

这样更容易保持场景中心稳定。

## screenSpacePanning：平移方向

`screenSpacePanning` 决定平移时按屏幕坐标移动，还是按世界坐标移动。

```ts
controls.screenSpacePanning = true;
```

- `true`：按屏幕方向平移，更像 2D 画布拖动。
- `false`：按相机上方向和世界方向计算，空间感更强。

这个参数只有在 `enablePan = true` 时才明显。

## enableRotate：是否允许旋转

```ts
controls.enableRotate = true;
```

如果只想允许缩放，不允许用户改变观察角度，可以关掉：

```ts
controls.enableRotate = false;
```

常见于固定视角的看板、地图、2D/3D 混合界面。

## keys：键盘控制

OrbitControls 可以配置键盘方向键：

```ts
controls.listenToKeyEvents(window);
controls.keys = {
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  BOTTOM: 'ArrowDown',
};
```

键盘控制主要影响平移。实际项目里是否启用要谨慎，因为方向键可能和页面滚动、表单输入冲突。

如果启用了键盘监听，销毁时仍然调用：

```ts
controls.dispose();
```

## mouseButtons：鼠标按键映射

可以重新定义左键、中键、右键分别做什么：

```ts
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN,
};
```

常见动作：

- `THREE.MOUSE.ROTATE`：旋转。
- `THREE.MOUSE.DOLLY`：缩放。
- `THREE.MOUSE.PAN`：平移。

如果你不想右键平移，可以关闭平移或改掉右键映射。

## touches：触摸手势映射

移动端可以配置单指、双指手势：

```ts
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
};
```

常见动作：

- `THREE.TOUCH.ROTATE`：旋转。
- `THREE.TOUCH.PAN`：平移。
- `THREE.TOUCH.DOLLY_PAN`：双指缩放和平移。
- `THREE.TOUCH.DOLLY_ROTATE`：双指缩放和旋转。

你的 canvas 如果要接管触摸操作，CSS 通常也要配合：

```css
canvas {
  touch-action: none;
}
```

否则浏览器默认滚动、缩放页面的行为可能会和 Three.js 控制冲突。

## saveState / reset：保存和恢复视角

OrbitControls 可以保存当前状态：

```ts
controls.saveState();
```

之后可以恢复：

```ts
controls.reset();
```

适合做“重置视角”按钮。

## 常用参数速查

| 参数                                  | 作用             |
| ------------------------------------- | ---------------- |
| `target`                              | 围绕哪个点观察   |
| `enableDamping`                       | 是否开启阻尼     |
| `dampingFactor`                       | 阻尼强度         |
| `enableZoom`                          | 是否允许缩放     |
| `zoomSpeed`                           | 缩放速度         |
| `minDistance` / `maxDistance`         | 缩放距离范围     |
| `enableRotate`                        | 是否允许旋转     |
| `rotateSpeed`                         | 旋转速度         |
| `minPolarAngle` / `maxPolarAngle`     | 上下旋转范围     |
| `minAzimuthAngle` / `maxAzimuthAngle` | 左右旋转范围     |
| `enablePan`                           | 是否允许平移     |
| `panSpeed`                            | 平移速度         |
| `screenSpacePanning`                  | 平移方向计算方式 |
| `autoRotate`                          | 是否自动旋转     |
| `autoRotateSpeed`                     | 自动旋转速度     |
| `mouseButtons`                        | 鼠标按键映射     |
| `touches`                             | 触摸手势映射     |

## 事件监听

`OrbitControls` 可以监听交互事件：

```ts
controls.addEventListener('change', () => {
  console.log('camera.position', camera.position);
});

controls.addEventListener('start', () => {
  // 用户开始拖拽、缩放或平移
});

controls.addEventListener('end', () => {
  // 用户结束操作
});
```

常见事件：

| 事件     | 触发时机               |
| -------- | ---------------------- |
| `start`  | 用户开始操作           |
| `change` | 相机或 target 发生变化 |
| `end`    | 用户结束操作           |

调试相机位置时，`change` 很有用。比如你想知道某个好看的视角对应的 `camera.position`，就可以在 `change` 里打印。

## 销毁

React 组件卸载时要释放控制器事件监听：

```ts
controls.dispose();
```

否则页面切换后，旧控制器可能仍然持有 DOM 事件监听。
