# 外部 3D 模型 glTF / GLB

真实项目里很少只靠代码手写几何体。
角色、建筑、道具、场景通常会从 Blender、Maya、Cinema 4D 等软件导出，再加载到 Three.js 里。

Three.js 最推荐的 3D 模型格式是 glTF / GLB。

## glTF 和 GLB 是什么

glTF 是一种面向实时 3D 的模型格式。
它可以包含：

- 几何体
- 材质
- 贴图
- 骨骼
- 动画
- 相机
- 灯光扩展

常见有两种文件形式：

| 格式    | 特点                                           | 适合场景               |
| ------- | ---------------------------------------------- | ---------------------- |
| `.gltf` | JSON 文件，通常还会配套 `.bin` 和贴图文件。    | 调试方便，能直接看结构 |
| `.glb`  | 单个二进制文件，模型、贴图、动画可打包在一起。 | 部署方便，推荐上线使用 |

```text
model.gltf
├─ model.bin
├─ baseColor.png
└─ normal.png

model.glb
└─ 一个文件包含模型和资源
```

如果只是放到网页里使用，优先考虑 `.glb`。

## 安装和导入 GLTFLoader

`GLTFLoader` 不在 Three.js 核心入口里，而是在 examples/addons 里。

```ts
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
```

基础加载：

```ts
const loader = new GLTFLoader();

const gltf = await loader.loadAsync('/models/robot.glb');
scene.add(gltf.scene);
```

`gltf.scene` 是模型的根对象，通常是一个 `Group`。

## Vite 里怎么引用模型

如果模型放在 `public/`：

```text
public/models/robot.glb
```

代码里用绝对路径：

```ts
const gltf = await loader.loadAsync('/models/robot.glb');
```

如果模型放在 `src/assets/`，可以通过 import 得到 URL：

```ts
import robotUrl from '@/assets/models/robot.glb?url';

const gltf = await loader.loadAsync(robotUrl);
```

简单项目用 `public/models` 更直观。
需要跟随打包、hash 和模块引用时，可以放在 `src/assets`。

## 加载结果里有什么

`GLTFLoader` 返回的对象通常包含：

| 属性              | 作用               |
| ----------------- | ------------------ |
| `gltf.scene`      | 模型根对象，最常用 |
| `gltf.scenes`     | 文件里的所有场景   |
| `gltf.animations` | 动画片段数组       |
| `gltf.cameras`    | 模型文件里的相机   |
| `gltf.asset`      | glTF 资源元信息    |

常见写法：

```ts
const model = gltf.scene;
model.position.set(0, 0, 0);
model.scale.set(2, 2, 2);
scene.add(model);
```

## 模型是层级结构

加载出来的模型通常不是一个单独的 `Mesh`。
它更像一棵树：

```text
gltf.scene
├─ Armature
├─ BodyMesh
├─ HeadMesh
└─ Weapon
   └─ WeaponMesh
```

所以经常要用 `traverse()` 遍历：

```ts
gltf.scene.traverse((object) => {
  console.log(object.name, object.type);
});
```

给所有 mesh 开启阴影：

```ts
gltf.scene.traverse((object) => {
  if (object instanceof THREE.Mesh) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
});
```

## 调整模型大小和位置

外部模型经常存在：

- 太大
- 太小
- 不在原点
- 朝向不对
- 离地面有偏移

常见处理：

```ts
const model = gltf.scene;

model.position.set(0, 0, 0);
model.rotation.y = Math.PI;
model.scale.setScalar(0.5);

scene.add(model);
```

如果不知道模型尺寸，可以用包围盒测量：

```ts
const box = new THREE.Box3().setFromObject(model);
const size = new THREE.Vector3();
const center = new THREE.Vector3();

box.getSize(size);
box.getCenter(center);

console.log(size, center);
```

把模型中心移动到原点：

```ts
model.position.sub(center);
```

实际项目里更推荐在建模软件里处理好原点、比例和朝向。

## 材质和贴图

glTF 通常会自带 PBR 材质，加载后不一定需要重新创建材质。

如果要检查或修改材质：

```ts
gltf.scene.traverse((object) => {
  if (object instanceof THREE.Mesh) {
    const material = object.material;

    if (material instanceof THREE.MeshStandardMaterial) {
      material.roughness = 0.5;
      material.metalness = 0.1;
    }
  }
});
```

glTF 贴图的 `flipY` 通常由 `GLTFLoader` 处理好了。
不要像普通图片贴图那样随手改 `flipY`，否则可能上下颠倒。

## 播放模型动画

如果模型里带动画，`gltf.animations` 会有内容。
Three.js 用 `AnimationMixer` 播放动画。

```ts
const mixer = new THREE.AnimationMixer(gltf.scene);
const clip = gltf.animations[0];
const action = mixer.clipAction(clip);

action.play();
```

在渲染循环里更新：

```ts
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  mixer.update(delta);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

多个动画可以按名字查找：

```ts
const walk = THREE.AnimationClip.findByName(gltf.animations, 'Walk');
const action = mixer.clipAction(walk);
action.play();
```

## 加载进度和错误

`load()` 可以拿到进度：

```ts
loader.load(
  '/models/robot.glb',
  (gltf) => {
    scene.add(gltf.scene);
  },
  (event) => {
    const percent = (event.loaded / event.total) * 100;
    console.log(`${percent.toFixed(1)}%`);
  },
  (error) => {
    console.error('模型加载失败', error);
  },
);
```

多个模型或贴图一起加载时，可以配合 [加载管理器 LoadingManager](./loading-manager)。

## Draco 和 Meshopt 压缩

有些 glTF / GLB 会使用压缩。
如果模型加载报错，可能需要额外配置解码器。

Draco 示例：

```ts
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
```

压缩能减少下载体积，但会增加解码步骤。
入门阶段可以先使用未压缩或普通 `.glb`，等模型变大后再引入压缩。

## 释放模型资源

移除模型时，要释放几何体、材质和贴图。

```ts
scene.remove(model);

model.traverse((object) => {
  if (!(object instanceof THREE.Mesh)) return;

  object.geometry.dispose();

  const materials = Array.isArray(object.material) ? object.material : [object.material];

  materials.forEach((material) => {
    for (const value of Object.values(material)) {
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    }

    material.dispose();
  });
});
```

如果多个模型共用材质或贴图，不要重复释放共享资源。

## 常见问题

| 问题             | 常见原因           | 处理                                              |
| ---------------- | ------------------ | ------------------------------------------------- |
| 模型加载 404     | 路径不对。         | public 下用 `/models/xxx.glb`                     |
| 模型全黑         | 没有光照或环境。   | 加 `DirectionalLight` / `AmbientLight` / 环境贴图 |
| 模型太大或太小   | 建模单位不一致。   | 调 `scale`，最好回建模软件修正                    |
| 模型不在视野里   | 原点或位置偏移。   | 用 `Box3` 看尺寸和中心                            |
| 贴图上下颠倒     | 手动改了 `flipY`。 | glTF 贴图通常不要手改                             |
| 动画不播放       | 没有更新 mixer。   | 在渲染循环里调用 `mixer.update(delta)`            |
| 压缩模型加载失败 | 缺少解码器。       | 配置 `DRACOLoader` 或 Meshopt 解码器              |
