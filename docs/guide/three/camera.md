# 相机 Camera

相机决定“从哪里看场景，以及看到多大范围”。场景里可以有很多物体，但最终画面只会显示相机视野范围内的部分。

可以把相机想成一台摄影机：

- `position` 决定摄影机摆在哪里。
- `lookAt` 决定摄影机朝哪里看。
- `fov` 决定镜头有多广。
- `near` 和 `far` 决定离镜头太近或太远的内容是否会被裁掉。
- `aspect` 决定画面宽高比。

![PerspectiveCamera 参数示意图](/images/three-camera-frustum.svg)

## 透视相机 PerspectiveCamera

当前示例使用的是透视相机：

```ts
const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 200);
```

透视相机会模拟真实世界的近大远小：离相机越近的物体看起来越大，离相机越远的物体看起来越小。

参数顺序是：

```ts
PerspectiveCamera(fov, aspect, near, far);
```

## fov：视野角度

`fov` 是垂直方向的视野角度，单位是度。

```ts
const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 200);
```

这里的 `80` 表示相机垂直方向能看到约 80 度范围。

可以这样理解：

- `fov` 小：镜头更窄，更像长焦，物体更大，透视压缩更明显。
- `fov` 大：镜头更广，更像广角，能看到更多内容，但边缘透视变形更明显。

常见取值：

| fov          | 观感                             |
| ------------ | -------------------------------- |
| `35` 到 `50` | 更接近普通摄影镜头，画面稳       |
| `60` 到 `75` | 常见 3D 示例视角                 |
| `80` 以上    | 更广，适合展示空间，但透视感更强 |

## aspect：宽高比

`aspect` 是相机画面的宽高比：

```ts
camera.aspect = width / height;
camera.updateProjectionMatrix();
```

如果 `aspect` 和 `canvas` 的实际比例不一致，画面会被压扁或拉伸。

示例创建相机时先写 `1`：

```ts
const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 200);
```

这是一个初始值。真正的比例会在 `resizeRendererToCanvas` 中根据 `canvas.clientWidth` 和 `canvas.clientHeight` 更新。

修改 `aspect` 后必须调用：

```ts
camera.updateProjectionMatrix();
```

否则相机内部投影矩阵不会更新，新的宽高比不会生效。

## near 和 far：裁剪范围

`near` 和 `far` 决定相机能看见的距离范围：

```ts
new THREE.PerspectiveCamera(80, 1, 0.1, 200);
```

这里：

- `near = 0.1`：离相机小于 `0.1` 的物体不渲染。
- `far = 200`：离相机大于 `200` 的物体不渲染。

这两个参数不是越极端越好。`near` 太小、`far` 太大，会降低深度缓冲精度，可能导致两个面很近时闪烁，这叫 z-fighting。

常见建议：

- `near` 不要随便设成 `0.0001`。
- `far` 不要大到远超场景尺寸。
- 根据场景实际大小设置，比如当前示例相机和物体距离在几十以内，`far = 200` 足够。

## position：相机位置

相机默认在原点 `(0, 0, 0)`。如果物体也在原点，相机会像在物体内部，通常看不到正常画面。

当前示例把相机移到斜上方：

```ts
camera.position.set(30, 30, 30);
```

含义是：

- `x = 30`：向右移动。
- `y = 30`：向上移动。
- `z = 30`：向前或向后移动，取决于观察方向。

这样能从斜上方看到立方体、地面、坐标轴和网格线。

## lookAt：看向目标

相机移动后，还需要指定看向哪里：

```ts
camera.lookAt(0, 0, 0);
```

这表示相机看向世界原点。因为立方体通常放在原点附近，所以用这个值可以让物体出现在画面中心附近。

如果只设置 `position`，但不设置 `lookAt`，相机可能没有朝向物体。

## 相机控制器

当前示例使用 `OrbitControls` 来控制相机：

```ts
const controls = new OrbitControls(camera, canvas);

controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.enableZoom = true;
controls.minDistance = 15;
controls.maxDistance = 120;
```

`OrbitControls` 的核心是：相机围绕 `target` 旋转、拉近、拉远。

- `target`：围绕哪个点观察。
- `enableDamping`：开启阻尼，让操作更顺滑。
- `enableZoom`：是否允许滚轮缩放。
- `minDistance`：相机能拉到多近。
- `maxDistance`：相机能拉到多远。

因为启用了阻尼，所以每一帧要调用：

```ts
controls.update();
```

## 正交相机 OrthographicCamera

除了透视相机，Three.js 还有正交相机：

```ts
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
```

正交相机没有近大远小效果。同样大小的物体，不管远近，看起来都一样大。

![OrthographicCamera 原理图](/images/three-orthographic-camera.svg)

正交相机看到的不是一个“越远越宽的视锥”，而是一个固定宽高的盒子。盒子里的物体会被投影到屏幕上，投影线互相平行，所以不会产生近大远小。

参数可以这样理解：

- `left`：可见盒子的左边界。
- `right`：可见盒子的右边界。
- `top`：可见盒子的上边界。
- `bottom`：可见盒子的下边界。
- `near`：离相机太近的裁剪面。
- `far`：离相机太远的裁剪面。

示例：

```ts
const size = 20;
const aspect = width / height;

const camera = new THREE.OrthographicCamera(
  (-size * aspect) / 2,
  (size * aspect) / 2,
  size / 2,
  -size / 2,
  0.1,
  200,
);

camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);
```

这里的 `size` 决定垂直方向能看到多大范围，`aspect` 用来让水平方向和画布比例匹配。

它适合：

- 2D 风格画面。
- 工程视图。
- 地图。
- UI 或等距视角。
- 需要精确比较尺寸的场景。

透视相机和正交相机的区别：

![透视相机和正交相机对比](/images/three-camera-types.svg)

| 相机                 | 视觉效果 | 常见用途                   |
| -------------------- | -------- | -------------------------- |
| `PerspectiveCamera`  | 近大远小 | 游戏、真实感 3D、产品展示  |
| `OrthographicCamera` | 远近同大 | 2D、地图、工程图、等距视角 |

## 其他常见相机用法

Three.js 核心里最常用的是 `PerspectiveCamera` 和 `OrthographicCamera`。除此之外，还有一些相机类或扩展相机，适合特定场景。

### Camera

`Camera` 是相机基类，一般不会直接拿来渲染业务场景：

![Camera 基类示意图](/images/three-camera-base.svg)

```ts
const camera = new THREE.Camera();
```

它提供相机共有的基础能力，比如矩阵、世界矩阵、投影矩阵等。实际项目通常使用它的子类，例如 `PerspectiveCamera` 或 `OrthographicCamera`。

### CubeCamera

`CubeCamera` 用来从一个点向六个方向拍摄环境，常用于环境反射：

![CubeCamera 六方向采样示意图](/images/three-cube-camera.svg)

```ts
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
```

它不是给用户直接看场景的主相机，而是用来生成环境贴图。比如金属球、镜面材质需要反射周围环境时，可以用它动态捕获环境。

### StereoCamera

`StereoCamera` 用来生成左右眼两台相机，适合立体视觉或 VR 类效果：

![StereoCamera 左右眼示意图](/images/three-stereo-camera.svg)

```ts
const stereoCamera = new THREE.StereoCamera();
```

它会基于主相机拆出左眼和右眼视角。普通单屏网页很少直接使用它。

### ArrayCamera

`ArrayCamera` 可以同时管理多个子相机：

![ArrayCamera 多相机视口示意图](/images/three-array-camera.svg)

```ts
const camera = new THREE.ArrayCamera([cameraA, cameraB]);
```

它常见于多视口、多屏幕、VR 或特殊渲染场景。普通入门示例基本用不到。

### 示例扩展相机

Three.js 的 examples 中还有一些扩展相机或相机效果，例如 `CinematicCamera`。这类不是最基础的核心相机，通常用于景深、电影镜头等效果。

![CinematicCamera 景深示意图](/images/three-cinematic-camera.svg)

入门阶段可以先掌握：

1. `PerspectiveCamera`：真实 3D 视觉，项目当前使用它。
2. `OrthographicCamera`：2D、地图、工程图、等距视角。

其他相机等遇到环境反射、VR、多视口、电影镜头时再看。

### 等距视角

等距视角不是一种单独的相机类，通常用 `OrthographicCamera` 配合固定角度实现：

![等距视角示意图](/images/three-isometric-camera.svg)

```ts
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);
```

因为正交相机没有近大远小，所以用它做等距视角时，画面更像 2D 策略游戏、地图或工程图。

## 当前示例为什么用透视相机

当前示例展示的是立方体、地面、阴影和网格线。使用透视相机更容易看出空间深度：

```ts
const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 200);

camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);
```

这组参数的含义是：

- `80`：视角偏广，方便看到地面和辅助线。
- `1`：临时宽高比，后续 resize 时更新。
- `0.1`：允许离相机较近的内容显示。
- `200`：足够覆盖当前场景尺寸。
- `(30, 30, 30)`：从斜上方观察。
- `lookAt(0, 0, 0)`：看向场景中心。

调相机时可以按这个顺序排查：

1. 物体是否在相机前方。
2. 相机是否 `lookAt` 了目标。
3. 物体距离是否在 `near` 和 `far` 之间。
4. `aspect` 是否和画布比例一致。
5. `fov` 是否太大或太小。
