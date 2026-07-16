# 阴影 Shadow

阴影需要同时满足渲染器、光源、物体三层条件。

第一层：渲染器开启阴影。

```ts
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 过期了
renderer.shadowMap.type = THREE.PCFShadowMap;
```

第二层：光源允许投射阴影。

```ts
sunLight.castShadow = true;
```

第三层：物体声明自己是否投射或接收阴影。

```ts
cube.mesh.castShadow = true;
cube.mesh.receiveShadow = true;
ground.mesh.receiveShadow = true;
```

地面通常只需要接收阴影：

```ts
const geometry = new THREE.PlaneGeometry(1000, 1000);
const mesh = new THREE.Mesh(geometry, material);

mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
```

`PlaneGeometry` 默认是竖着的，所以要绕 x 轴旋转 `-Math.PI / 2`，让它平躺成地面。

方向光的阴影还需要设置阴影相机范围：

```ts
const shadowCameraSize = 50;

sunLight.shadow.camera.left = -shadowCameraSize;
sunLight.shadow.camera.right = shadowCameraSize;
sunLight.shadow.camera.top = shadowCameraSize;
sunLight.shadow.camera.bottom = -shadowCameraSize;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 80;
```

范围太小，阴影可能被裁掉；范围太大，同样大小的阴影贴图会覆盖更大区域，阴影会变糊。

阴影清晰度由阴影贴图尺寸影响：

```ts
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
```

数值越大阴影越清晰，但 GPU 开销也越高。
