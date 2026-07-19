# 加载管理器 LoadingManager

`LoadingManager` 用来统一管理多个加载器的加载过程。
它最常见的作用是做全局进度条、加载状态提示和错误收集。

当一个场景里有多张贴图、多个模型或字体需要一起加载时，单独监听每个加载器会比较分散。
这时候把它们挂到同一个 `LoadingManager` 上，状态就能统一处理。

## 基本用法

```ts
const manager = new THREE.LoadingManager();

manager.onStart = (url, itemsLoaded, itemsTotal) => {
  console.log('start', url, itemsLoaded, itemsTotal);
};

manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  console.log('progress', url, itemsLoaded, itemsTotal);
};

manager.onLoad = () => {
  console.log('all loaded');
};

manager.onError = (url) => {
  console.log('error', url);
};
```

然后把这个 manager 传给具体加载器：

```ts
const manager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(manager);
const gltfLoader = new GLTFLoader(manager);
```

这样这些加载器会共享同一套加载状态。

## 回调含义

- `onStart`：第一个资源开始加载时触发。
- `onProgress`：任意资源有进度变化时触发。
- `onLoad`：所有资源都加载完成后触发。
- `onError`：某个资源失败时触发。

注意，`onLoad` 不是“某一个文件加载完成”，而是“所有受管理的资源都完成”。

## 适合的场景

- 首屏要先显示加载进度。
- 需要一次性预加载一组纹理或模型。
- 需要把加载失败统一转成兜底状态。

## 常见组合

```ts
const manager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(manager);

const sunTexture = textureLoader.load(sunTextureUrl);
const earthTexture = textureLoader.load(earthTextureUrl);
const moonTexture = textureLoader.load(moonTextureUrl);
```

这类写法在多资源场景里很常见，尤其适合配合加载页或占位骨架屏。
