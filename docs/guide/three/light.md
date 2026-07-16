# 光照 Light

光照决定受光材质的明暗关系。对于 `MeshStandardMaterial` 这类材质，光源非常重要。

当前示例使用了两种光：

```ts
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
```

`AmbientLight` 用来补亮整体暗部，`DirectionalLight` 用来产生主要光照方向和阴影。

![常见 Three.js 光源类型](/images/three-light-types.svg)

常见光源区别：环境光补整体亮度，方向光给主方向，点光源从一点发散，聚光灯只照锥形区域。

## AmbientLight

环境光没有位置和方向，会均匀照亮所有受光材质：

```ts
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
```

它适合做基础补光。没有环境光时，背光面可能会黑得看不清；加一点环境光后，暗部仍然能保留轮廓。

但环境光不会产生高光，也不会产生阴影，所以不能用它做主光。

## DirectionalLight

方向光可以理解成太阳光。它的光线互相平行，适合做主光和阴影：

```ts
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);

sunLight.position.set(30, 20, 30);
sunLight.castShadow = true;
```

`DirectionalLight` 的 `position` 主要用来决定光照方向。比如 `(30, 20, 30)` 表示从右上前方照向场景中心。调这个值时主要看阴影方向和物体明暗面是否清楚。

## PointLight

点光源像灯泡，从一个点向四周发光：

```ts
const pointLight = new THREE.PointLight(0xffffff, 1, 50);

pointLight.position.set(8, 10, 8);
```

它适合模拟灯泡、路灯、火光、发光球。点光源通常会随距离衰减，离光源越远越暗。

## SpotLight

聚光灯像手电筒或舞台灯，只照一个锥形范围：

```ts
const spotLight = new THREE.SpotLight(0xffffff, 1.2);

spotLight.position.set(12, 18, 12);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.3;
spotLight.castShadow = true;
```

`angle` 控制光锥大小，`penumbra` 控制边缘柔和程度。

## HemisphereLight

半球光有天空颜色和地面颜色，适合做户外环境补光：

```ts
const hemisphereLight = new THREE.HemisphereLight(0xbfdfff, 0x444444, 0.8);
```

它不投射阴影，通常和 `DirectionalLight` 搭配使用。

## 光源选择

| 目标                   | 推荐光源                            |
| ---------------------- | ----------------------------------- |
| 只想让模型别太黑       | `AmbientLight` 或 `HemisphereLight` |
| 做太阳光、主光、投影   | `DirectionalLight`                  |
| 做灯泡、火光、发光球   | `PointLight`                        |
| 做手电筒、舞台灯、车灯 | `SpotLight`                         |
