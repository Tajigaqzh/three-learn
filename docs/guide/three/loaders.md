# 加载器 Loaders

Three.js 的加载器负责把外部资源变成 Three.js 能直接使用的对象。
常见输入是 URL、文件路径或二进制数据，常见输出是纹理、模型、字体、音频和文本数据。

在仓库里的太阳系示例中，贴图就是先通过 Vite 变成资源 URL，再交给 `TextureLoader` 加载：

```ts
import sunTextureUrl from './assets/sun.jpeg';

const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load(sunTextureUrl);

sunTexture.colorSpace = THREE.SRGBColorSpace;
```

这里有两个关键点：

- Vite 会把图片导入成可访问的 URL。
- `TextureLoader` 会把这个 URL 再转换成 Three.js 的 `Texture`。

## 常见加载方式

`Loader.load()` 的基本形式是：

```ts
loader.load(url, onLoad, onProgress, onError);
```

- `onLoad`：资源加载成功后触发。
- `onProgress`：加载过程中触发。
- `onError`：加载失败时触发。

很多加载器也支持 `loadAsync()`，更适合和 `async/await` 搭配：

```ts
const texture = await loader.loadAsync(url);
```

## 常见加载器

| 加载器              | 作用                 | 常见用途             |
| ------------------- | -------------------- | -------------------- |
| `TextureLoader`     | 加载单张纹理         | 贴图、图标、背景图   |
| `CubeTextureLoader` | 加载立方体纹理       | 天空盒、环境贴图     |
| `GLTFLoader`        | 加载 glTF / GLB 模型 | 角色、道具、场景模型 |
| `FontLoader`        | 加载字体数据         | 3D 文字              |
| `FileLoader`        | 加载文本或二进制文件 | JSON、配置、原始数据 |
| `AudioLoader`       | 加载音频             | 音效、背景音乐       |

大多数进阶加载器都放在 `three/examples/jsm/loaders/` 里。

## 纹理加载注意点

纹理加载后，通常还要补两步：

```ts
texture.colorSpace = THREE.SRGBColorSpace;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

- `colorSpace` 让颜色贴图按 sRGB 方式显示，避免发灰。
- `anisotropy` 能改善远处或斜视角下的贴图清晰度。

## 什么时候用加载器

- 需要从本地图片、远程图片或 CDN 加载贴图。
- 需要导入 glTF 模型、字体或音频资源。
- 需要把资源加载流程和场景初始化解耦。

如果只有简单几何体，不需要外部资源，就不一定要用加载器。

模型加载是加载器里最常见的实践之一，继续看：[外部 3D 模型 glTF / GLB](./gltf-models)。
