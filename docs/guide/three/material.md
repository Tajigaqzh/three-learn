# 材质 Material

材质决定物体表面如何显示。
几何体负责“形状”，材质负责“这个形状看起来像什么”。

```ts
const geometry = new THREE.BoxGeometry(4, 4, 4);
const material = new THREE.MeshStandardMaterial({
  color: 0x2196f3,
  roughness: 0.3,
  metalness: 0.2,
});

const mesh = new THREE.Mesh(geometry, material);
```

材质会控制这些东西：

- 基础颜色
- 是否使用贴图
- 是否受光照影响
- 是否透明
- 是否显示背面
- 粗糙度、金属感、高光
- 是否线框显示
- 深度测试、混合、渲染排序

## 材质和 Mesh 的关系

`Mesh` 是“几何体 + 材质”的组合：

```text
Geometry  决定形状
Material  决定外观
Mesh      把形状和外观放进场景
```

同一个几何体，换材质后效果会完全不同：

```ts
const geometry = new THREE.BoxGeometry(4, 4, 4);

const redBasic = new THREE.MeshBasicMaterial({ color: 0xff3333 });
const metal = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  roughness: 0.2,
  metalness: 1,
});

const meshA = new THREE.Mesh(geometry, redBasic);
const meshB = new THREE.Mesh(geometry, metal);
```

## 常用材质对照

| 材质                   | 是否受光照 | 主要特点                                   | 常见用途                        |
| ---------------------- | ---------- | ------------------------------------------ | ------------------------------- |
| `MeshBasicMaterial`    | 否         | 不受灯光影响，颜色和贴图直接显示。         | 入门示例、标记、UI 面板、调试   |
| `MeshStandardMaterial` | 是         | 基于 PBR，支持粗糙度、金属度，最常用。     | 大多数真实感物体                |
| `MeshPhysicalMaterial` | 是         | 在 Standard 基础上增加清漆、透光、折射等。 | 玻璃、车漆、透明塑料            |
| `MeshLambertMaterial`  | 是         | 漫反射，便宜但没有高光。                   | 性能敏感的简单受光物体          |
| `MeshPhongMaterial`    | 是         | 旧式高光模型，可调高光颜色和强度。         | 带高光的旧项目或简单 shiny 效果 |
| `MeshNormalMaterial`   | 否         | 用法线方向显示颜色。                       | 调试法线、检查模型表面方向      |
| `MeshDepthMaterial`    | 否         | 按离相机远近显示深浅。                     | 深度调试、特殊后处理            |
| `MeshMatcapMaterial`   | 否         | 用 matcap 贴图模拟光照。                   | 雕塑预览、低成本风格化材质      |

入门阶段最常用的是：

- 不需要光照：`MeshBasicMaterial`
- 需要真实明暗：`MeshStandardMaterial`

## MeshDepthMaterial

`MeshDepthMaterial` 不显示真实颜色，只根据物体离相机的远近来着色。

```ts
const material = new THREE.MeshDepthMaterial();
```

可以把它理解成“深度可视化材质”：

```text
近处亮
远处暗
```

它的作用主要是：

- 检查模型深度关系
- 调试遮挡和阴影问题
- 配合后处理做深度效果
- 做特殊遮罩或过渡效果

它的特点：

- 不受普通灯光影响
- 不显示物体原本的颜色
- 重点是“远近”，不是“表面材质”

常用属性：

| 属性                | 效果                                                | 常见值                    |
| ------------------- | --------------------------------------------------- | ------------------------- |
| `depthPacking`      | 深度打包方式，后处理或阴影相关场景会用到。          | `THREE.BasicDepthPacking` |
| `map`               | 颜色贴图，但它不是最终主色，更多用于透明/裁剪辅助。 | `Texture`                 |
| `alphaMap`          | 透明度贴图。                                        | `Texture`                 |
| `alphaTest`         | 按透明度阈值裁剪像素。                              | `0 ~ 1`                   |
| `displacementMap`   | 位移贴图，会真正移动顶点，影响深度结果。            | `Texture`                 |
| `displacementScale` | 位移强度。                                          | `0 ~ n`                   |
| `displacementBias`  | 位移偏移。                                          | `0 ~ n`                   |
| `wireframe`         | 用线框方式看深度。                                  | `true / false`            |

深度从哪里开始、到哪里结束，主要由当前相机的 `near` 和 `far` 决定，不是这个材质自己单独控制。

如果你只是想看模型表面朝向，通常用 `MeshNormalMaterial`。
如果你想看物体离相机远近的深浅变化，用 `MeshDepthMaterial`。

## MeshLambertMaterial

`MeshLambertMaterial` 是一种受光材质，基于漫反射模型。
它会根据光照方向显示明暗，但没有 `MeshStandardMaterial` 那么真实，也没有那么重的计算成本。

```ts
const material = new THREE.MeshLambertMaterial({
  color: 0x2196f3,
});
```

它的特点：

- 会受灯光影响。
- 有明暗变化。
- 没有高光细节。
- 比 `MeshStandardMaterial` 更轻量。

常用属性：

| 属性                | 效果                                      | 常见值         |
| ------------------- | ----------------------------------------- | -------------- |
| `color`             | 基础颜色。                                | `0x2196f3`     |
| `map`               | 颜色贴图，会和 `color` 一起影响最终颜色。 | `Texture`      |
| `emissive`          | 自发光颜色，让物体暗部也带有发光色。      | `0x000000`     |
| `emissiveMap`       | 自发光贴图。                              | `Texture`      |
| `emissiveIntensity` | 自发光强度。                              | `0 ~ n`        |
| `aoMap`             | 环境遮蔽贴图，让缝隙更暗。                | `Texture`      |
| `aoMapIntensity`    | 环境遮蔽强度。                            | `0 ~ 1`        |
| `lightMap`          | 预烘焙光照贴图。                          | `Texture`      |
| `lightMapIntensity` | 光照贴图强度。                            | `0 ~ n`        |
| `wireframe`         | 显示线框。                                | `true / false` |

适合：

- 简单角色
- 卡通风格
- 低成本受光物体
- 不需要金属、粗糙度那套 PBR 细节的场景

和 `MeshStandardMaterial` 比：

| 材质                   | 明暗表现 | 高光 | 真实感 | 成本 |
| ---------------------- | -------- | ---- | ------ | ---- |
| `MeshLambertMaterial`  | 有       | 没有 | 较弱   | 较低 |
| `MeshStandardMaterial` | 有       | 有   | 更强   | 较高 |

如果你只想让物体“跟着灯光亮暗变化”，Lambert 就够用。
如果你要更真实的金属、塑料、粗糙表面，优先用 Standard。

## MeshBasicMaterial

`MeshBasicMaterial` 是最简单的材质，不受光照影响。

```ts
const material = new THREE.MeshBasicMaterial({
  color: 0x2196f3,
});
```

它的特点是：场景里没有灯光也能显示颜色和贴图。

基础立方体示例给每个面生成了一张 `CanvasTexture`，再贴到 `MeshBasicMaterial` 上：

```ts
const texture = new THREE.CanvasTexture(canvas);

const material = new THREE.MeshBasicMaterial({
  map: texture,
});
```

适合：

- 入门阶段
- UI 标记
- 图片面板
- 调试辅助对象
- 不需要真实明暗关系的物体

如果你想看灯光产生的明暗变化，不要用它。

## MeshStandardMaterial

`MeshStandardMaterial` 是 Three.js 里最常用的真实感材质。
它会受到光照影响，适合配合 `AmbientLight`、`DirectionalLight`、`PointLight` 等光源。

```ts
const material = new THREE.MeshStandardMaterial({
  color: 0x2196f3,
  roughness: 0.3,
  metalness: 0.2,
});
```

常见参数：

| 参数                | 作用                         | 常见范围   |
| ------------------- | ---------------------------- | ---------- |
| `color`             | 基础颜色。                   | `0x2196f3` |
| `roughness`         | 粗糙度，越高反光越散。       | `0 ~ 1`    |
| `metalness`         | 金属度，越高越像金属。       | `0 ~ 1`    |
| `map`               | 颜色贴图。                   | `Texture`  |
| `normalMap`         | 法线贴图，增加表面凹凸细节。 | `Texture`  |
| `roughnessMap`      | 粗糙度贴图。                 | `Texture`  |
| `metalnessMap`      | 金属度贴图。                 | `Texture`  |
| `aoMap`             | 环境遮蔽贴图。               | `Texture`  |
| `emissive`          | 自发光颜色。                 | `0x000000` |
| `emissiveMap`       | 自发光贴图。                 | `Texture`  |
| `emissiveIntensity` | 自发光强度。                 | `0 ~ n`    |

```text
roughness 低：表面更亮、更锐利
roughness 高：表面更粗糙、更哑光

metalness 低：塑料、木头、石头
metalness 高：金属、镜面反射更明显
```

使用这类材质时，场景里通常需要添加光源。
否则物体可能很暗，甚至看不清。

## MeshMatcapMaterial

`MeshMatcapMaterial` 是一种用 matcap 贴图模拟光照的材质。
它不根据场景里的真实灯光计算明暗，而是根据模型表面的法线方向，从一张 matcap 图片里取颜色。

```ts
const matcapTexture = new THREE.TextureLoader().load('/textures/matcap.png');

const material = new THREE.MeshMatcapMaterial({
  matcap: matcapTexture,
});
```

可以把 matcap 理解成一张“预烘焙的光照球”：

```text
matcap 贴图
┌─────────┐
│  高光   │
│ 阴影 球 │
│  反射   │
└─────────┘

模型表面法线 -> 去 matcap 里取对应颜色
```

它的特点：

- 不需要 `DirectionalLight`、`PointLight` 这类真实光源。
- 效果主要由 matcap 贴图决定。
- 性能成本通常比真实 PBR 光照低。
- 很适合雕塑预览、角色展示、风格化材质和快速出效果。

它的限制：

- 不会真实响应场景里的光源方向。
- 不适合需要真实金属、粗糙度、环境反射的场景。
- 没有 `MeshStandardMaterial` 那套完整的 `roughness` / `metalness` 工作流。

常用属性：

| 属性          | 效果                                   | 常见值         |
| ------------- | -------------------------------------- | -------------- |
| `color`       | 基础颜色，会和 matcap 贴图颜色相乘。   | `0xffffff`     |
| `matcap`      | 核心贴图，决定整体光照风格。           | `Texture`      |
| `map`         | 颜色贴图，叠加模型本身颜色细节。       | `Texture`      |
| `normalMap`   | 法线贴图，让 matcap 效果也能表现凹凸。 | `Texture`      |
| `bumpMap`     | 灰度凹凸贴图。                         | `Texture`      |
| `bumpScale`   | 凹凸强度。                             | `0 ~ n`        |
| `alphaMap`    | 透明度贴图。                           | `Texture`      |
| `transparent` | 是否启用透明。                         | `true / false` |
| `opacity`     | 整体透明度。                           | `0 ~ 1`        |
| `flatShading` | 平面着色，让三角面边界更明显。         | `true / false` |

如果你只是想让模型“看起来有光照质感”，但不想配置复杂光源，`MeshMatcapMaterial` 很方便。
如果你要做真实材质和真实灯光关系，优先用 `MeshStandardMaterial`。

## MeshPhysicalMaterial

`MeshPhysicalMaterial` 是比 `MeshStandardMaterial` 更进一步的 PBR 材质。
它适合更复杂的真实表面，比如玻璃、车漆、透明塑料、金属涂层。

```ts
const material = new THREE.MeshPhysicalMaterial({
  color: 0xcccccc,
  roughness: 0.2,
  metalness: 0.8,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});
```

常用属性：

| 属性                        | 效果                                 | 常见值            |
| --------------------------- | ------------------------------------ | ----------------- |
| `color`                     | 基础颜色。                           | `0xcccccc`        |
| `roughness`                 | 越高越哑光，越低越光滑。             | `0 ~ 1`           |
| `metalness`                 | 越高越接近金属。                     | `0 ~ 1`           |
| `clearcoat`                 | 表面增加一层清漆，高光更像车漆外层。 | `0 ~ 1`           |
| `clearcoatRoughness`        | 清漆层粗糙度，越低清漆高光越锐。     | `0 ~ 1`           |
| `clearcoatMap`              | 用贴图控制清漆强度。                 | `Texture`         |
| `clearcoatRoughnessMap`     | 用贴图控制清漆层粗糙度。             | `Texture`         |
| `clearcoatNormalMap`        | 清漆层自己的法线贴图。               | `Texture`         |
| `clearcoatNormalScale`      | 清漆层法线强度。                     | `Vector2`         |
| `anisotropy`                | 拉丝金属、各向异性高光。             | `0 ~ 1`           |
| `anisotropyRotation`        | 各向异性方向旋转。                   | `0 ~ Math.PI * 2` |
| `anisotropyMap`             | 用贴图控制各向异性。                 | `Texture`         |
| `iridescence`               | 薄膜彩虹感，角度不同颜色会变。       | `0 ~ 1`           |
| `iridescenceIOR`            | 彩虹膜折射率。                       | `1.0 ~ 2.333`     |
| `iridescenceThicknessRange` | 彩虹膜厚度范围。                     | `[100, 400]`      |
| `iridescenceMap`            | 用贴图控制彩虹效果强度。             | `Texture`         |
| `iridescenceThicknessMap`   | 用贴图控制彩虹膜厚度。               | `Texture`         |
| `transmission`              | 透光程度，适合玻璃、透明塑料。       | `0 ~ 1`           |
| `transmissionMap`           | 用贴图控制透光程度。                 | `Texture`         |
| `ior`                       | 折射率，影响透明材质的折射感。       | `1.0 ~ 2.333`     |
| `thickness`                 | 透明物体厚度，影响透光和吸收。       | `0 ~ n`           |
| `thicknessMap`              | 用贴图控制厚度。                     | `Texture`         |
| `attenuationColor`          | 光穿过材质后被染成什么颜色。         | `0xffffff`        |
| `attenuationDistance`       | 光穿过多远后明显衰减。               | `0 ~ n`           |
| `sheen`                     | 布料、绒面这类柔和边缘反光。         | `0 ~ 1`           |
| `sheenColor`                | 绒面或布料反光颜色。                 | `Color`           |
| `sheenColorMap`             | 用贴图控制绒面颜色。                 | `Texture`         |
| `sheenRoughness`            | 绒面反光粗糙度。                     | `0 ~ 1`           |
| `sheenRoughnessMap`         | 用贴图控制绒面粗糙度。               | `Texture`         |
| `specularIntensity`         | 非金属表面的镜面反射强度。           | `0 ~ 1`           |
| `specularIntensityMap`      | 用贴图控制镜面反射强度。             | `Texture`         |
| `specularColor`             | 非金属表面的镜面颜色。               | `Color`           |
| `specularColorMap`          | 用贴图控制镜面颜色。                 | `Texture`         |

适合：

- 玻璃
- 车漆
- 透明塑料
- 高级产品展示

如果 Standard 够用，就没必要一开始上 Physical。

## MeshPhongMaterial

`MeshPhongMaterial` 是老式的高光材质。
它会受光照影响，并且会产生明显高光，但没有 Standard 那套 PBR 的真实感。

```ts
const material = new THREE.MeshPhongMaterial({
  color: 0x2196f3,
  shininess: 60,
  specular: 0x444444,
});
```

常用属性：

| 属性                | 效果                                      | 常见值         |
| ------------------- | ----------------------------------------- | -------------- |
| `color`             | 物体基础颜色。                            | `0x2196f3`     |
| `map`               | 颜色贴图，会和 `color` 共同影响最终颜色。 | `Texture`      |
| `specular`          | 高光颜色，决定反光亮斑偏什么颜色。        | `0xffffff`     |
| `shininess`         | 高光锐利程度，越高高光越小越硬。          | `30 ~ 100`     |
| `specularMap`       | 用贴图控制哪些区域有高光。                | `Texture`      |
| `normalMap`         | 模拟表面凹凸，影响光照但不改变轮廓。      | `Texture`      |
| `bumpMap`           | 用灰度图模拟凹凸，比 `normalMap` 简单。   | `Texture`      |
| `bumpScale`         | 凹凸强度。                                | `0 ~ n`        |
| `emissive`          | 自发光颜色，让物体自己发亮。              | `0x000000`     |
| `emissiveIntensity` | 自发光强度。                              | `0 ~ n`        |
| `envMap`            | 环境贴图，产生反射感。                    | `Texture`      |
| `reflectivity`      | 环境反射强度。                            | `0 ~ 1`        |
| `wireframe`         | 显示三角网格线框。                        | `true / false` |

```text
shininess 低：高光大、散、柔
shininess 高：高光小、集中、硬

specular 偏白：像普通亮斑
specular 带颜色：高光会带颜色倾向
```

它适合：

- 旧项目
- 简单高光效果
- 比 Lambert 更亮一点的受光物体

如果是新项目，通常优先 `MeshStandardMaterial`。

## MeshNormalMaterial

`MeshNormalMaterial` 会把法线方向直接映射成颜色。
它不是拿来做最终展示的，而是拿来调试模型表面方向的。

```ts
const material = new THREE.MeshNormalMaterial();
```

特点：

- 不受灯光影响。
- 颜色来自法线，不是真实材质颜色。
- 很适合检查模型是否翻面、法线是否正确。

```text
朝向不同的面，显示不同颜色
```

常用属性：

| 属性          | 效果                                             | 常见值             |
| ------------- | ------------------------------------------------ | ------------------ |
| `flatShading` | 使用平面着色，每个三角面颜色更硬，方便看面结构。 | `true / false`     |
| `wireframe`   | 以线框显示法线颜色材质。                         | `true / false`     |
| `side`        | 控制显示正面、背面或双面。                       | `THREE.DoubleSide` |
| `transparent` | 是否启用透明。                                   | `true / false`     |
| `opacity`     | 透明度。                                         | `0 ~ 1`            |

## MeshToonMaterial

`MeshToonMaterial` 是卡通材质。
它会把光照分成比较硬的几档，形成类似手绘动画的明暗分层。

```ts
const material = new THREE.MeshToonMaterial({
  color: 0x2196f3,
});
```

它的特点：

- 有光照反应。
- 明暗过渡更硬。
- 很适合卡通、漫画、动画风格。

常用属性：

| 属性                | 效果                                   | 常见值         |
| ------------------- | -------------------------------------- | -------------- |
| `color`             | 卡通材质的基础颜色。                   | `0x2196f3`     |
| `map`               | 颜色贴图。                             | `Texture`      |
| `gradientMap`       | 控制明暗分层，让卡通边界更明确。       | `Texture`      |
| `normalMap`         | 增加表面细节，让卡通光照也能看到凹凸。 | `Texture`      |
| `emissive`          | 自发光颜色。                           | `0x000000`     |
| `emissiveIntensity` | 自发光强度。                           | `0 ~ n`        |
| `wireframe`         | 显示线框。                             | `true / false` |

如果要更强的卡通分层效果，可以配合渐变贴图。

## PointsMaterial

`PointsMaterial` 用于 `Points` 对象，也就是点云 / 粒子。

```ts
const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
});
```

常用属性：

| 属性              | 效果                                     | 常见值         |
| ----------------- | ---------------------------------------- | -------------- |
| `color`           | 点的基础颜色。                           | `0xffffff`     |
| `size`            | 点大小。                                 | `0.01 ~ 10`    |
| `sizeAttenuation` | 是否随距离变小；开启后远处点更小。       | `true / false` |
| `map`             | 点贴图，可做圆点、星光、烟尘。           | `Texture`      |
| `alphaMap`        | 透明度贴图。                             | `Texture`      |
| `transparent`     | 是否启用透明。                           | `true / false` |
| `opacity`         | 点透明度。                               | `0 ~ 1`        |
| `alphaTest`       | 丢弃透明度低的像素，常用于去掉贴图黑边。 | `0 ~ 1`        |
| `vertexColors`    | 是否使用每个顶点自己的颜色。             | `true / false` |

适合：

- 粒子系统
- 星点
- 点云
- 简单特效

## SpriteMaterial

`SpriteMaterial` 用于 `Sprite`。
Sprite 是始终面向相机的 2D 精灵，常用于标记、图标、HUD 和简单特效。

```ts
const material = new THREE.SpriteMaterial({
  map: texture,
  transparent: true,
});
```

特点：

- 始终朝向相机。
- 适合 2D 图标和场景标记。
- 常和透明贴图一起用。

常用属性：

| 属性              | 效果                             | 常见值            |
| ----------------- | -------------------------------- | ----------------- |
| `color`           | 精灵基础颜色，会和贴图颜色相乘。 | `0xffffff`        |
| `map`             | 精灵贴图，比如图标、光斑、标签。 | `Texture`         |
| `rotation`        | 精灵自身在屏幕朝向上的旋转。     | `0 ~ Math.PI * 2` |
| `sizeAttenuation` | 是否随距离缩小。                 | `true / false`    |
| `transparent`     | 是否启用透明。                   | `true / false`    |
| `opacity`         | 精灵透明度。                     | `0 ~ 1`           |
| `alphaTest`       | 裁剪透明边缘。                   | `0 ~ 1`           |

## ShadowMaterial

`ShadowMaterial` 只用来接收阴影。
它本身是半透明的，常作为“看不见的地面”来展示阴影。

```ts
const material = new THREE.ShadowMaterial({
  opacity: 0.3,
});
```

适合：

- 只想看到地上的阴影，不想要明显地面材质时
- 做干净的阴影投影展示

常见写法：

```ts
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), material);
ground.receiveShadow = true;
```

常用属性：

| 属性          | 效果                                 | 常见值      |
| ------------- | ------------------------------------ | ----------- |
| `opacity`     | 阴影可见程度，越高阴影越明显。       | `0.2 ~ 0.6` |
| `color`       | 阴影材质颜色，通常用黑色或灰色。     | `0x000000`  |
| `transparent` | 通常需要透明，让地面本身尽量不可见。 | `true`      |
| `depthWrite`  | 常用于避免透明材质深度问题。         | `false`     |

## ShaderMaterial

`ShaderMaterial` 允许你自己写顶点着色器和片元着色器。
它适合自定义视觉效果，不适合拿来当普通材质入门起点。

```ts
const material = new THREE.ShaderMaterial({
  vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `,
});
```

适合：

- 自定义特效
- 扫光
- 溶解
- 流光
- 水波
- 屏幕特效

常用属性：

| 属性             | 效果                          | 常见值                   |
| ---------------- | ----------------------------- | ------------------------ |
| `vertexShader`   | 顶点着色器，控制顶点位置等。  | GLSL 字符串              |
| `fragmentShader` | 片元着色器，控制像素颜色。    | GLSL 字符串              |
| `uniforms`       | 从 JS 传给 shader 的变量。    | `{ time: { value: 0 } }` |
| `transparent`    | shader 输出透明度时需要开启。 | `true / false`           |
| `side`           | 控制正面、背面或双面。        | `THREE.DoubleSide`       |
| `depthTest`      | 是否参与深度测试。            | `true / false`           |
| `depthWrite`     | 是否写入深度缓冲。            | `true / false`           |
| `blending`       | 混合模式，常用于发光、粒子。  | `THREE.AdditiveBlending` |

## RawShaderMaterial

`RawShaderMaterial` 比 `ShaderMaterial` 更底层。
它不会自动注入 Three.js 预定义的一些 shader 变量，适合你完全自己管理 shader 内容。

```ts
const material = new THREE.RawShaderMaterial({
  vertexShader: `...`,
  fragmentShader: `...`,
});
```

如果你不清楚它和 `ShaderMaterial` 的区别，先用 `ShaderMaterial`。

常用属性和 `ShaderMaterial` 类似，但你需要自己声明更多 GLSL 输入。

| 属性             | 效果                  |
| ---------------- | --------------------- |
| `vertexShader`   | 完整顶点着色器源码    |
| `fragmentShader` | 完整片元着色器源码    |
| `uniforms`       | JS 传入 shader 的变量 |
| `glslVersion`    | 指定 GLSL 版本        |

## MeshDistanceMaterial

`MeshDistanceMaterial` 用来计算物体到某个点的距离颜色，常见于阴影和特殊深度效果内部。
它更多是 Three.js 内部或高级渲染用途，平时业务代码里不常直接用。

```ts
const material = new THREE.MeshDistanceMaterial();
```

如果你的目标是普通场景展示，通常不需要直接碰它。

常用属性：

| 属性                | 效果                                       | 常见值    |
| ------------------- | ------------------------------------------ | --------- |
| `map`               | 颜色贴图。                                 | `Texture` |
| `alphaMap`          | 透明度贴图。                               | `Texture` |
| `alphaTest`         | 按透明度阈值裁剪像素，常用于透明物体投影。 | `0 ~ 1`   |
| `displacementMap`   | 位移贴图，会改变用于距离计算的顶点位置。   | `Texture` |
| `displacementScale` | 位移强度。                                 | `0 ~ n`   |
| `displacementBias`  | 位移偏移。                                 | `0 ~ n`   |

点光源阴影内部会用到距离计算。业务代码里更常见的用法，是把它设置到对象的 `customDistanceMaterial` 上，控制透明物体或位移物体如何投射点光源阴影。

常用属性：

| 属性                | 效果                             | 常见值         |
| ------------------- | -------------------------------- | -------------- |
| `map`               | 颜色贴图。                       | `Texture`      |
| `alphaMap`          | 透明度贴图。                     | `Texture`      |
| `displacementMap`   | 位移贴图，改变投影时的表面位置。 | `Texture`      |
| `displacementScale` | 位移强度。                       | `0 ~ n`        |
| `displacementBias`  | 位移偏移。                       | `0 ~ n`        |
| `wireframe`         | 线框显示。                       | `true / false` |

## 常用基础属性

这些属性在很多材质上都能用：

| 属性          | 作用                   | 示例                               |
| ------------- | ---------------------- | ---------------------------------- |
| `color`       | 基础颜色。             | `color: 0xff0000`                  |
| `map`         | 颜色贴图。             | `map: texture`                     |
| `transparent` | 是否启用透明。         | `transparent: true`                |
| `opacity`     | 透明度。               | `opacity: 0.5`                     |
| `side`        | 渲染正面、背面或双面。 | `side: THREE.DoubleSide`           |
| `wireframe`   | 是否显示线框。         | `wireframe: true`                  |
| `visible`     | 材质是否可见。         | `visible: false`                   |
| `depthTest`   | 是否参与深度测试。     | `depthTest: true`                  |
| `depthWrite`  | 是否写入深度缓冲。     | `depthWrite: false`                |
| `blending`    | 混合方式。             | `blending: THREE.AdditiveBlending` |
| `alphaTest`   | 透明裁剪阈值。         | `alphaTest: 0.5`                   |

常见写法：

```ts
const material = new THREE.MeshBasicMaterial({
  map: texture,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide,
});
```

## 常用属性详解

### color

`color` 是材质的基础颜色。

```ts
const material = new THREE.MeshStandardMaterial({
  color: 0x2196f3,
});
```

也可以创建后再修改：

```ts
material.color.set(0xff0000);
material.color.set('#00aaff');
material.color.set('orange');
```

注意：如果材质同时设置了 `color` 和 `map`，最终颜色通常会受到两者共同影响。
可以简单理解成：贴图颜色会乘上材质颜色。

```ts
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  map: texture,
});
```

如果你希望贴图按原色显示，通常把 `color` 保持为白色：

```ts
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: texture,
});
```

### map

`map` 是颜色贴图，也就是最常说的“把图片贴到物体表面”。

```ts
const texture = new THREE.TextureLoader().load('/images/brick.jpg');

const material = new THREE.MeshStandardMaterial({
  map: texture,
});
```

要让 `map` 正常显示，几何体需要有 UV。
内置几何体通常已经带 UV，比如 `BoxGeometry`、`SphereGeometry`、`PlaneGeometry`。
自定义 `BufferGeometry` 要自己提供 `uv`。

```ts
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
```

颜色贴图通常要设置颜色空间：

```ts
texture.colorSpace = THREE.SRGBColorSpace;
```

`map` 决定材质用哪张图。
纹理怎么重复、旋转、平移、过滤，则设置在 `Texture` 上：

```ts
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4);
texture.center.set(0.5, 0.5);
texture.rotation = Math.PI / 2;
```

### wireframe

`wireframe` 会把三角面显示成线框。

```ts
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
```

它显示的是几何体的三角网格结构：

```text
普通面片
┌─────┐
│     │
└─────┘

wireframe
┌─────┐
│＼   │
└──＼─┘
```

适合：

- 检查模型分段数。
- 检查自定义几何体三角面是否连对。
- 调试模型拓扑。
- 做线框风格效果。

注意：`wireframe` 不是“外轮廓线”。
它会显示所有三角面的边，模型分段越多，线越密。

### transparent 和 opacity

`opacity` 控制透明度，但必须配合 `transparent: true`。

```ts
const material = new THREE.MeshBasicMaterial({
  color: 0x00aaff,
  transparent: true,
  opacity: 0.5,
});
```

含义：

- `opacity = 1`：完全不透明。
- `opacity = 0.5`：半透明。
- `opacity = 0`：完全透明。

只写下面这样通常不会得到预期透明效果：

```ts
material.opacity = 0.5;
```

正确写法：

```ts
material.transparent = true;
material.opacity = 0.5;
```

透明物体容易遇到排序问题。
如果透明面前后显示异常，可以尝试：

```ts
material.depthWrite = false;
```

### alphaTest

`alphaTest` 用来做透明裁剪。
它不是半透明，而是按透明度阈值决定一个像素要不要画。

```ts
const material = new THREE.MeshBasicMaterial({
  map: leafTexture,
  alphaTest: 0.5,
});
```

适合：

- 树叶
- 草片
- 栅栏
- 镂空贴纸

```text
透明度 >= 0.5：显示
透明度 <  0.5：丢弃
```

它比半透明排序更稳定，但边缘不会像真正半透明那样柔和。

### side

`side` 决定材质渲染哪一面。

```ts
const material = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
});
```

常见配置：

| 配置               | 效果               |
| ------------------ | ------------------ |
| `THREE.FrontSide`  | 只渲染正面，默认值 |
| `THREE.BackSide`   | 只渲染背面         |
| `THREE.DoubleSide` | 正反两面都渲染     |

平面、叶片、纸张、布片这类没有厚度的模型，经常需要 `DoubleSide`。
但双面渲染成本更高，不要所有材质都默认开。

### roughness

`roughness` 是 `MeshStandardMaterial` 常用属性，表示表面粗糙度。

```ts
const material = new THREE.MeshStandardMaterial({
  roughness: 0.2,
});
```

范围通常是 `0 ~ 1`：

| 值    | 效果             |
| ----- | ---------------- |
| `0`   | 很光滑，高光集中 |
| `0.5` | 中等粗糙         |
| `1`   | 很粗糙，反光分散 |

```text
roughness 低：亮、滑、反射更集中
roughness 高：哑光、粗糙、反射更分散
```

### metalness

`metalness` 表示金属度，也是 `MeshStandardMaterial` 常用属性。

```ts
const material = new THREE.MeshStandardMaterial({
  metalness: 1,
});
```

范围通常是 `0 ~ 1`：

| 值  | 效果                         |
| --- | ---------------------------- |
| `0` | 非金属，比如塑料、木头、石头 |
| `1` | 金属                         |

真实材质里，很多东西不是半金属。
通常要么接近 `0`，要么接近 `1`。

金属材质很依赖环境反射。
如果没有环境贴图，`metalness = 1` 的物体可能看起来发黑或不真实。

### normalMap

`normalMap` 是法线贴图，用来模拟表面的细小凹凸。
它不会真的改变几何体轮廓，但会影响光照计算。

```ts
const material = new THREE.MeshStandardMaterial({
  map: colorTexture,
  normalMap: normalTexture,
});
```

适合：

- 砖墙纹理
- 皮革纹理
- 石头表面
- 金属划痕

如果你想让轮廓也真的改变，需要看 `displacementMap`，但它要求几何体有足够多的顶点。

### emissive

`emissive` 是自发光颜色。
它会让物体自己看起来发亮，但不会自动照亮其他物体。

```ts
const material = new THREE.MeshStandardMaterial({
  color: 0x222222,
  emissive: 0xff6600,
  emissiveIntensity: 2,
});
```

常用于：

- 灯牌
- 屏幕
- 发光按钮
- 火焰或能量效果

如果要真的照亮周围，还需要加光源，比如 `PointLight`。

### depthTest 和 depthWrite

这两个属性和深度缓冲有关，常用于透明物体、UI 面板和特殊效果。

```ts
material.depthTest = true;
material.depthWrite = false;
```

- `depthTest`：是否根据深度判断遮挡关系。
- `depthWrite`：当前材质是否把自己的深度写入深度缓冲。

普通不透明物体通常保持默认。
透明物体排序异常时，才会考虑调 `depthWrite`。

### visible

`visible` 可以让材质不可见：

```ts
material.visible = false;
```

更多时候会直接控制对象：

```ts
mesh.visible = false;
```

区别是：

- `mesh.visible` 控制整个物体和子级是否显示。
- `material.visible` 只控制这个材质是否显示。

## 贴图相关属性

材质上的贴图属性决定“用哪张纹理参与计算”。
纹理对象自己的属性决定“这张图怎么采样、重复、旋转”。

| 材质属性          | 作用                     | 常见材质                 |
| ----------------- | ------------------------ | ------------------------ |
| `map`             | 基础颜色贴图。           | Basic / Standard / Phong |
| `alphaMap`        | 透明度贴图。             | Basic / Standard / Phong |
| `normalMap`       | 法线贴图，模拟细节凹凸。 | Standard / Phong         |
| `roughnessMap`    | 控制不同区域的粗糙度。   | Standard                 |
| `metalnessMap`    | 控制不同区域的金属度。   | Standard                 |
| `aoMap`           | 环境遮蔽，让缝隙更暗。   | Standard                 |
| `emissiveMap`     | 自发光贴图。             | Standard / Phong         |
| `displacementMap` | 真正移动顶点，改变轮廓。 | Standard / Phong         |

示例：

```ts
const material = new THREE.MeshStandardMaterial({
  map: colorTexture,
  normalMap: normalTexture,
  roughnessMap: roughnessTexture,
  metalnessMap: metalnessTexture,
});
```

注意：贴图怎么重复、旋转、过滤，要去设置 `Texture`：

```ts
colorTexture.wrapS = THREE.RepeatWrapping;
colorTexture.wrapT = THREE.RepeatWrapping;
colorTexture.repeat.set(4, 4);
```

继续看下一章：[纹理 Texture](./texture)。

## 透明材质

只设置 `opacity` 不一定会透明，还要打开 `transparent`：

```ts
const material = new THREE.MeshBasicMaterial({
  color: 0x00aaff,
  transparent: true,
  opacity: 0.5,
});
```

透明物体常见问题是排序不对。
如果出现前后关系异常，可以尝试：

```ts
material.depthWrite = false;
```

或者调整物体的渲染顺序：

```ts
mesh.renderOrder = 10;
```

对于树叶、栅栏、贴纸这类“要么显示，要么不显示”的透明图，常用 `alphaTest`：

```ts
const material = new THREE.MeshBasicMaterial({
  map: leafTexture,
  alphaTest: 0.5,
});
```

`alphaTest` 会直接裁掉透明度低于阈值的像素，比半透明排序更稳定。

## 单面、双面和背面

材质默认只渲染正面：

```ts
side: THREE.FrontSide;
```

常见取值：

| 配置               | 效果             | 场景                 |
| ------------------ | ---------------- | -------------------- |
| `THREE.FrontSide`  | 只显示正面。     | 默认，大多数模型     |
| `THREE.BackSide`   | 只显示背面。     | 天空盒内侧、特殊效果 |
| `THREE.DoubleSide` | 正反两面都显示。 | 纸片、叶子、平面面板 |

平面、叶子、布片这类没有厚度的对象，经常需要：

```ts
const material = new THREE.MeshStandardMaterial({
  color: 0x66aa66,
  side: THREE.DoubleSide,
});
```

但 `DoubleSide` 会增加渲染成本，不要所有材质都默认开。

## 线框模式

`wireframe` 可以把三角面显示成线框：

```ts
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
```

它适合：

- 检查模型拓扑
- 看分段数是否合适
- 做调试效果
- 做简单科技风表现

## 材质和光照的关系

不是所有材质都会受灯光影响：

| 材质                   | 是否受光照影响 | 是否需要法线 | 常见用途             |
| ---------------------- | -------------- | ------------ | -------------------- |
| `MeshBasicMaterial`    | 否             | 否           | 贴图、标记、调试     |
| `MeshStandardMaterial` | 是             | 是           | 常规真实感物体       |
| `MeshPhysicalMaterial` | 是             | 是           | 玻璃、车漆、透明材质 |
| `MeshLambertMaterial`  | 是             | 是           | 简单漫反射           |
| `MeshPhongMaterial`    | 是             | 是           | 带高光的旧式材质     |
| `MeshNormalMaterial`   | 否             | 是           | 法线调试             |

如果你发现灯光怎么调都不影响物体，先检查材质是不是 `MeshBasicMaterial`。
如果自定义几何体受光材质显示不对，再检查几何体有没有 `normal`。

## 修改材质后不生效

有些属性改完会自动生效，比如 `color`、`roughness`、`opacity`：

```ts
material.color.set(0xff0000);
material.roughness = 0.8;
material.opacity = 0.5;
```

但有些会影响 shader 编译的属性，改完后最好标记：

```ts
material.transparent = true;
material.needsUpdate = true;
```

常见需要注意的属性包括：

- `transparent`
- `side`
- `map`
- `normalMap`
- `alphaTest`
- `wireframe`

如果只是换整套材质，通常直接替换：

```ts
mesh.material.dispose();
mesh.material = newMaterial;
```

## 资源释放

材质会占用 GPU 资源，不再使用时需要释放：

```ts
material.dispose();
```

如果材质上挂了贴图，贴图也要释放：

```ts
material.map?.dispose();
material.normalMap?.dispose();
material.roughnessMap?.dispose();
material.metalnessMap?.dispose();
material.dispose();
```

如果多个材质共用同一张贴图，不要在其中一个材质释放时随手把共享贴图也释放掉。

## 贴图网站

https://github.com/nidorx/matcaps
