# 阴影 Shadow

阴影用来表达物体之间的空间关系。
没有阴影时，物体可能看起来像“浮”在画面里；有了阴影，观众能更容易判断物体离地面的距离、光从哪里来、场景是否真实。

```text
没有阴影
   □

有阴影
   □
  ░░░
```

在 Three.js 里，阴影不是默认开启的。
因为阴影需要额外渲染一遍阴影贴图，会增加 GPU 成本。

## 阴影是什么

现实里，阴影来自光被物体遮挡。

```text
光源
  \
   \    物体
    \    □
     \  / \
      \/   \____ 地面上的阴影
```

Three.js 的常见阴影实现叫 shadow map。
它的大致过程是：

1. 先从光源视角看场景，记录哪些地方离光源最近。
2. 再从相机视角渲染画面。
3. 对每个像素判断：它是否被别的物体挡住了光。
4. 被挡住的地方变暗，就形成阴影。

```text
光源视角：生成 shadow map
相机视角：使用 shadow map 判断哪里该变暗
```

所以阴影不是简单的“画一个黑色椭圆”。
它和光源、物体、接收面、渲染器都有关。

## 为什么要用阴影

阴影主要解决三个问题：

- 空间关系：看出物体是否贴着地面、离墙多远。
- 光照方向：看出主光从左边、右边、上方还是后方来。
- 真实感：让物体融入场景，而不是像贴上去的图。

```text
阴影短而硬：光源近、方向明确、物体靠近接收面
阴影长而斜：光源角度低
阴影软而散：光源面积更大或使用了柔化阴影
```

## 哪些光能产生阴影

不是所有光源都能产生阴影。

| 光源               | 是否能投射阴影 | 阴影特点                         | 常见用途               |
| ------------------ | -------------- | -------------------------------- | ---------------------- |
| `DirectionalLight` | 能             | 像太阳光，方向一致，适合大场景。 | 太阳、主光、户外阴影   |
| `SpotLight`        | 能             | 只在聚光灯锥形范围内有阴影。     | 手电筒、舞台灯、车灯   |
| `PointLight`       | 能             | 从一个点向四周投影，成本较高。   | 灯泡、火光、小范围点光 |
| `AmbientLight`     | 不能           | 均匀补光，没有方向。             | 提亮暗部               |
| `HemisphereLight`  | 不能           | 天空和地面两个方向的环境补光。   | 户外环境光             |

当前示例主要使用 `DirectionalLight`，可以理解成太阳光。

## 阴影需要三层条件

Three.js 阴影需要同时满足三层条件：

1. 渲染器开启阴影。
2. 光源允许投射阴影。
3. 物体声明自己是否投射或接收阴影。

缺任何一层，阴影都不会出现。

## 开启渲染器阴影

第一层是渲染器：

```ts
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
```

`renderer.shadowMap.enabled = true` 表示整个渲染器允许计算阴影。

`shadowMap.type` 决定阴影过滤方式：

| 类型                     | 效果                   | 说明                       |
| ------------------------ | ---------------------- | -------------------------- |
| `THREE.BasicShadowMap`   | 边缘硬，成本低。       | 最简单，锯齿可能明显       |
| `THREE.PCFShadowMap`     | 边缘有过滤，比较常用。 | 当前项目使用               |
| `THREE.PCFSoftShadowMap` | 边缘更柔和。           | 柔一点，但不等于真实面积光 |
| `THREE.VSMShadowMap`     | 可做更柔的阴影。       | 需要更注意漏光和参数       |

入门阶段可以先用：

```ts
renderer.shadowMap.type = THREE.PCFShadowMap;
```

## 开启光源阴影

第二层是光源：

```ts
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);

sunLight.position.set(30, 20, 30);
sunLight.castShadow = true;
```

`castShadow = true` 表示这盏灯会生成阴影贴图。

注意：光源能照亮物体，不代表它一定会投射阴影。
阴影要单独打开。

## 设置物体投射和接收阴影

第三层是物体：

```ts
cube.mesh.castShadow = true;
cube.mesh.receiveShadow = true;
ground.mesh.receiveShadow = true;
```

含义是：

- `castShadow`：这个物体会不会挡光、投出阴影。
- `receiveShadow`：这个物体表面会不会显示别的物体投来的阴影。

常见配置：

| 对象               | `castShadow` | `receiveShadow` | 原因                 |
| ------------------ | ------------ | --------------- | -------------------- |
| 立方体、角色、道具 | `true`       | 视情况          | 它们通常要投影到地面 |
| 地面、墙面         | 通常 `false` | `true`          | 主要用来接收阴影     |
| 天空盒、背景       | `false`      | `false`         | 不参与阴影           |
| 透明 UI 面板       | 通常 `false` | 通常 `false`    | 避免排序和视觉问题   |

地面示例：

```ts
const geometry = new THREE.PlaneGeometry(1000, 1000);
const mesh = new THREE.Mesh(geometry, material);

mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
```

`PlaneGeometry` 默认竖在 x/y 平面上。
作为地面时，需要绕 x 轴旋转 `-Math.PI / 2`，让它平躺。

## DirectionalLight 的阴影相机

方向光的阴影不是覆盖无限空间。
它会用一台隐藏的正交相机，从光源方向观察场景，只有相机范围内的东西才会进入阴影计算。

```text
DirectionalLight shadow camera

┌────────────────────┐
│                    │
│   会计算阴影的区域  │
│                    │
└────────────────────┘
```

当前示例里会设置这台阴影相机：

```ts
const shadowCameraSize = 50;

sunLight.shadow.camera.left = -shadowCameraSize;
sunLight.shadow.camera.right = shadowCameraSize;
sunLight.shadow.camera.top = shadowCameraSize;
sunLight.shadow.camera.bottom = -shadowCameraSize;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 80;
```

这些参数决定阴影覆盖范围：

- `left` / `right`：水平范围。
- `top` / `bottom`：垂直范围。
- `near` / `far`：离光源方向的深度范围。

范围太小，阴影会被裁掉。
范围太大，同样大小的阴影贴图要覆盖更大区域，阴影会变糊。

```text
范围小：清晰，但容易裁掉阴影
范围大：不容易裁掉，但阴影更糊
```

调试时可以加 `CameraHelper`：

```ts
const helper = new THREE.CameraHelper(sunLight.shadow.camera);
scene.add(helper);
```

## 阴影清晰度 mapSize

阴影清晰度主要受阴影贴图尺寸影响：

```ts
sunLight.shadow.mapSize.set(1024, 1024);
```

也可以分开写：

```ts
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
```

常见取值：

| 尺寸          | 效果                 | 成本 |
| ------------- | -------------------- | ---- |
| `512 x 512`   | 较糊，但便宜。       | 低   |
| `1024 x 1024` | 入门和中小场景常用。 | 中   |
| `2048 x 2048` | 更清晰。             | 高   |
| `4096 x 4096` | 很清晰但很贵。       | 很高 |

不要只靠无限增大 `mapSize` 提高清晰度。
更重要的是把阴影相机范围调到刚好覆盖需要阴影的区域。

## 阴影边缘和 bias

阴影有时会出现条纹、闪烁、表面脏点，这常被叫做 shadow acne。
原因是深度精度不够，表面自己错误地挡住了自己。

可以尝试调 `bias`：

```ts
sunLight.shadow.bias = -0.0005;
```

或者调 `normalBias`：

```ts
sunLight.shadow.normalBias = 0.02;
```

经验：

- 有条纹、自阴影噪点：尝试调 `bias` 或 `normalBias`。
- 阴影和物体分离，好像飘起来：bias 可能太大。
- 参数不要一次调太大，微调更容易找到平衡。

## 常见问题

| 问题                           | 常见原因                            | 检查点                                         |
| ------------------------------ | ----------------------------------- | ---------------------------------------------- |
| 完全没有阴影                   | 三层条件缺一层。                    | 渲染器、光源、物体是否都开启                   |
| 地面不显示阴影                 | 地面没有接收阴影。                  | `ground.receiveShadow = true`                  |
| 物体不投影                     | 物体没有投射阴影。                  | `mesh.castShadow = true`                       |
| 阴影被截断                     | 阴影相机范围太小。                  | `shadow.camera.left/right/top/bottom/near/far` |
| 阴影太糊                       | 阴影相机范围太大或 `mapSize` 太小。 | 收紧范围，提高 `mapSize`                       |
| 阴影有条纹                     | 深度精度问题。                      | 调 `bias` / `normalBias`                       |
| 灯光亮但没阴影                 | 光源照亮和投影是两件事。            | `light.castShadow = true`                      |
| `MeshBasicMaterial` 看不出明暗 | 材质不受光照。                      | 换 `MeshStandardMaterial`                      |

## 实战配置

一个常见的方向光阴影配置：

```ts
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(30, 20, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);

const shadowCameraSize = 50;
sunLight.shadow.camera.left = -shadowCameraSize;
sunLight.shadow.camera.right = shadowCameraSize;
sunLight.shadow.camera.top = shadowCameraSize;
sunLight.shadow.camera.bottom = -shadowCameraSize;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 80;

cube.castShadow = true;
cube.receiveShadow = true;
ground.receiveShadow = true;
```

这段代码的重点不是每个数字都固定，而是配置关系：

- 渲染器负责允许阴影。
- 光源负责生成阴影。
- 物体负责声明投射和接收。
- 阴影相机负责决定阴影覆盖范围。
- `mapSize` 负责决定阴影贴图精度。
