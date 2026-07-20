# 纹理 Texture

纹理就是贴到模型表面的图片数据。Three.js 里的纹理通常来自图片、Canvas、视频或程序生成的像素数据。

最常见的使用方式是把纹理传给材质：

```ts
const texture = new THREE.TextureLoader().load('/images/earth.jpg');

const material = new THREE.MeshBasicMaterial({
  map: texture,
});
```

可以把它理解成“贴图坐标系里的图片”。
模型表面的每个点，都会根据自己的 UV 坐标去纹理里取颜色。

纹理看起来“清不清楚”，不只取决于图片本身，还取决于采样方式。

## 常用属性

下面这些是 Three.js 里最常改的纹理属性：

| 属性               | 作用                                                             | 常见写法                                                         |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `wrapS`            | 水平方向超出 UV 范围时怎么处理。                                 | `texture.wrapS = THREE.RepeatWrapping;`                          |
| `wrapT`            | 竖直方向超出 UV 范围时怎么处理。                                 | `texture.wrapT = THREE.RepeatWrapping;`                          |
| `repeat`           | 纹理重复次数。                                                   | `texture.repeat.set(4, 2);`                                      |
| `offset`           | 纹理整体平移。                                                   | `texture.offset.set(0.2, 0);`                                    |
| `center`           | 旋转和缩放的中心点。                                             | `texture.center.set(0.5, 0.5);`                                  |
| `rotation`         | 纹理旋转角度，单位是弧度。                                       | `texture.rotation = Math.PI / 2;`                                |
| `flipY`            | 是否在上传 GPU 前上下翻转。                                      | `texture.flipY = false;`                                         |
| `minFilter`        | 缩小时如何采样。                                                 | `texture.minFilter = THREE.LinearMipmapLinearFilter;`            |
| `magFilter`        | 放大时如何采样。                                                 | `texture.magFilter = THREE.LinearFilter;`                        |
| `generateMipmaps`  | 是否自动生成 mipmap。                                            | `texture.generateMipmaps = true;`                                |
| `anisotropy`       | 斜视角下的纹理清晰度。                                           | `texture.anisotropy = renderer.capabilities.getMaxAnisotropy();` |
| `colorSpace`       | 颜色空间。颜色贴图通常用 sRGB。                                  | `texture.colorSpace = THREE.SRGBColorSpace;`                     |
| `matrixAutoUpdate` | 是否自动根据 `offset`、`repeat`、`rotation`、`center` 更新矩阵。 | `texture.matrixAutoUpdate = true;`                               |

这几个里面，最常碰到的是 `wrapS`、`wrapT`、`repeat`、`offset`、`center`、`rotation`、`minFilter`、`magFilter`、`generateMipmaps`、`flipY`、`colorSpace` 和 `anisotropy`。

## 纹理怎么重复

默认情况下，纹理只在 `0 ~ 1` 的 UV 范围内显示一次。
如果模型表面更大，超出的部分会被夹在边缘。

```text
UV 空间
0 ------- 1

默认情况
[A B C D]
只显示一次
```

想让纹理平铺重复，需要两步：

1. 把包裹方式改成可重复。
2. 设置重复次数。

```ts
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 2);
```

含义是：

- `wrapS`：水平方向怎么处理超出 `0 ~ 1` 的部分。
- `wrapT`：竖直方向怎么处理超出 `0 ~ 1` 的部分。
- `repeat.set(4, 2)`：横向重复 4 次，纵向重复 2 次。

```text
重复 4 x 2
[A][B][C][D] [A][B][C][D]
[A][B][C][D] [A][B][C][D]
```

常见包裹方式：

| 配置                     | 效果                           | 适合场景               |
| ------------------------ | ------------------------------ | ---------------------- |
| `ClampToEdgeWrapping`    | 超出部分贴住边缘像素，不重复。 | 默认值，适合普通图片   |
| `RepeatWrapping`         | 超出部分直接按纹理重复。       | 地面、墙面、砖块、地毯 |
| `MirroredRepeatWrapping` | 超出部分镜像重复。             | 需要来回对称拼接的图案 |

如果你发现 `repeat.set()` 没效果，先检查 `wrapS` 和 `wrapT` 有没有改成 `RepeatWrapping`。

## 纹理怎么平移

`offset` 用来移动纹理在 UV 空间里的起点。

```ts
texture.offset.set(0.25, 0);
```

这表示纹理在水平方向移动四分之一。
它常和 `repeat` 一起用，比如做流动水面、滚动背景、移动的条纹。

```ts
function animate() {
  texture.offset.x += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

```text
原来
[A][B][C][D]

offset.x = 0.25
[B][C][D][A]
```

## 纹理怎么旋转

纹理旋转的是 UV 贴图坐标，不是模型本身。
也就是说，转的是“贴在表面的图片”，不是几何体。

```ts
texture.center.set(0.5, 0.5);
texture.rotation = Math.PI / 2;
```

这两个属性要一起看：

- `center`：旋转中心，通常设成 `(0.5, 0.5)`，也就是纹理中心。
- `rotation`：旋转角度，单位是弧度。

```text
旋转前          旋转后
┌─────┐        ┌─────┐
│  ↑  │        │  →  │
│  │  │  -->   │  │  │
└─────┘        └─────┘
```

常用角度：

- `Math.PI / 2`：旋转 90 度
- `Math.PI`：旋转 180 度
- `Math.PI * 1.5`：旋转 270 度
- `Math.PI * 2`：旋转一整圈

如果你只设置 `rotation`，但不改 `center`，纹理通常会绕左下角附近转，看起来不直观。
大多数场景都先设 `center.set(0.5, 0.5)`。

## flipY 是什么

`flipY` 决定纹理上传到 GPU 前是否上下翻转。

```ts
texture.flipY = false;
```

普通 `TextureLoader` 加载的图片通常不用改。
但 glTF 模型里的贴图经常需要 `flipY = false`，因为 glTF 的纹理坐标约定和普通图片贴图不完全一样。

如果你发现贴图上下颠倒，可以先检查 `flipY`。

## 采样是什么

屏幕上的一个像素，不一定刚好对应纹理里的一个像素。

当物体靠近、远离、放大、缩小时，GPU 都要决定“该从纹理里怎么取色”。
这个过程就叫采样。

```text
原始纹理
[A][B][C][D][E][F][G][H]

贴到小面上
        [  1 个屏幕像素  ]

贴到大面上
[A][A][B][B][C][C][D][D]
```

一般分两种情况：

- `minification`：纹理被缩小，一个屏幕像素要综合很多纹理像素。
- `magnification`：纹理被放大，一个纹理像素要覆盖很多屏幕像素。

Three.js 里对应的是：

- `minFilter`：缩小时怎么采样。
- `magFilter`：放大时怎么采样。

## minFilter 有哪些配置

`minFilter` 决定纹理被缩小时的显示效果。

```ts
texture.minFilter = THREE.LinearMipmapLinearFilter;
```

常见取值如下：

| 配置                         | 是否用 mipmap | 画面效果                                   | 典型用途                         |
| ---------------------------- | ------------- | ------------------------------------------ | -------------------------------- |
| `NearestFilter`              | 否            | 最近点采样，边缘硬，颗粒感最强。           | 像素风、调试、保留块状感         |
| `LinearFilter`               | 否            | 线性插值，画面更平滑。                     | 简单缩小、不想启用 mipmap        |
| `NearestMipmapNearestFilter` | 是            | 先选一个 mipmap 层，再用最近点采样。       | 像素风，但希望远处稳定一点       |
| `NearestMipmapLinearFilter`  | 是            | 在两个 mipmap 层之间混合，层内仍是最近点。 | 像素感保留得多一些，同时减少闪烁 |
| `LinearMipmapNearestFilter`  | 是            | 先选一个 mipmap 层，再做线性插值。         | 需要平滑，但不想跨层混合太多     |
| `LinearMipmapLinearFilter`   | 是            | 层内线性插值，再在两层之间线性混合。       | 最平滑，远处最稳定，默认常用     |

## 这几个配置怎么选

```text
缩小时

NearestFilter
[###][###][###]

LinearFilter
[▓▓▓][▓▓▓][▓▓▓]

LinearMipmapLinearFilter
L0: [###]
L1: [## ]
L2: [#  ]
      ↑ 按距离自动选层，再平滑混合
```

- 想要锐利、像素块感明显，选 `NearestFilter`。
- 想要普通平滑效果，选 `LinearFilter`。
- 想要远处更稳、不闪烁，优先用带 mipmap 的过滤。
- 想要综合效果最好，通常直接用 `LinearMipmapLinearFilter`。

## mipmap 是什么

mipmap 是一组逐级缩小的纹理副本。

```text
L0: 1024 x 1024
L1:  512 x 512
L2:  256 x 256
L3:  128 x 128
```

远处看模型时，GPU 不会一直拿原图硬算，而是优先用更小的层级。
这样能减少摩尔纹、闪烁和细碎噪点。

`generateMipmaps` 控制是否自动生成这些缩小层级：

```ts
texture.generateMipmaps = true;
```

- `true`：Three.js 自动生成 mipmap，普通静态图片通常保持默认。
- `false`：不生成 mipmap，动态纹理、视频纹理或手动提供 mipmap 时会用到。

如果 `minFilter` 使用了 `NearestMipmapNearestFilter`、`NearestMipmapLinearFilter`、`LinearMipmapNearestFilter` 或 `LinearMipmapLinearFilter`，就要确保有 mipmap 可用。

## magFilter 怎么看

`magFilter` 只管放大时的采样，常见只有两种：

- `NearestFilter`：放大后更硬、更像素化。
- `LinearFilter`：放大后更平滑。

如果你只记一个经验：

- 小图贴大面，优先看 `magFilter`。
- 大图贴小面，优先看 `minFilter`。

## colorSpace 怎么设置

颜色贴图通常要设置成 `SRGBColorSpace`：

```ts
texture.colorSpace = THREE.SRGBColorSpace;
```

如果不设置，颜色可能看起来发灰或不对。

不是所有贴图都应该用 sRGB。
一般可以这样判断：

| 贴图类型                       | 推荐                   |
| ------------------------------ | ---------------------- |
| `map` / 颜色贴图 / base color  | `THREE.SRGBColorSpace` |
| `emissiveMap` / 自发光颜色贴图 | `THREE.SRGBColorSpace` |
| `normalMap`                    | 不设置 sRGB            |
| `roughnessMap`                 | 不设置 sRGB            |
| `metalnessMap`                 | 不设置 sRGB            |
| `aoMap`                        | 不设置 sRGB            |

一句话：给人看的颜色图用 sRGB；给计算用的数据图不要用 sRGB。

## anisotropy 是什么

`anisotropy` 用来改善斜视角下的纹理清晰度，常见于地面、道路、墙面这类铺得很远的贴图。

```ts
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

它不是越大越免费。
数值越高，斜视角更清楚，但采样成本也更高。
实际项目里可以先用渲染器支持的最大值做演示，性能敏感时再降下来。

```text
低 anisotropy：远处地面容易糊成一片
高 anisotropy：斜着看的纹理还能保留更多细节
```

## 在哪里找纹理

poliigon.com
3dtextures.me
arroway-textures.ch
substance3d.com

## 实战建议

- 普通图片贴图，通常直接用默认值。
- 需要远处稳定，保留 `LinearMipmapLinearFilter`。
- 像素风项目，通常会改成 `NearestFilter`，有时连 mipmap 也会一起控制。
- 如果贴图明显发糊，先看是否被缩得太厉害，再看 `minFilter` 和 `anisotropy`。
