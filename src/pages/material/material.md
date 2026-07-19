# Three.js 常见 Material 对比

本页面示例里展示了几类常见材质：`MeshBasicMaterial`、`MeshLambertMaterial`、
`MeshPhongMaterial`、`MeshStandardMaterial`、`MeshPhysicalMaterial`、`MeshToonMaterial`、
`MeshNormalMaterial`、`MeshDepthMaterial`、`MeshMatcapMaterial`，以及开启 `wireframe` 的
`MeshBasicMaterial`。它们的核心区别主要在于：是否受光照影响、是否基于物理渲染、视觉风格和性能成本。

## 快速对比

| Material               | 是否受光照影响 | 主要特点                                      | 适用场景                                   |
| ---------------------- | -------------- | --------------------------------------------- | ------------------------------------------ |
| `MeshBasicMaterial`    | 否             | 颜色或贴图直接显示，不计算光照                | UI 标记、天空盒、纯色辅助物体、调试对象    |
| `MeshLambertMaterial`  | 是             | 漫反射光照，表面柔和，没有高光                | 粗糙物体、低成本场景、卡通或非写实模型     |
| `MeshPhongMaterial`    | 是             | 支持镜面高光，可调 `shininess`                | 塑料、抛光表面、旧项目中的高光材质         |
| `MeshStandardMaterial` | 是             | PBR 标准材质，使用 `roughness` 和 `metalness` | 大多数真实感物体、现代项目默认材质         |
| `MeshPhysicalMaterial` | 是             | Standard 的增强版，支持清漆、透光、折射等     | 车漆、玻璃、高级塑料、需要更真实的材质     |
| `MeshToonMaterial`     | 是             | 阶梯式明暗，偏卡通渲染                        | 卡通风、低多边形风格、插画化场景           |
| `MeshNormalMaterial`   | 否             | 用法线方向映射 RGB 颜色                       | 调试模型法线、检查几何体表面方向           |
| `MeshDepthMaterial`    | 否             | 根据相机深度显示明暗                          | 深度调试、后期效果、阴影或特效辅助         |
| `MeshMatcapMaterial`   | 否             | 使用 matcap 贴图模拟固定光照效果              | 预览模型、雕刻展示、无需真实灯光的质感效果 |
| `wireframe` 材质       | 取决于基础材质 | 只显示三角网格线                              | 观察模型拓扑、调试几何结构                 |

## 各材质说明

### MeshBasicMaterial

`MeshBasicMaterial` 不参与光照计算。场景里有没有灯光、灯光位置如何，都不会影响它的明暗。

适合用在不需要真实受光的对象上，比如辅助标记、背景、图标、纯色调试模型，或者始终需要保持可见的对象。它的渲染成本较低，但缺点是缺少立体感。

### MeshLambertMaterial

`MeshLambertMaterial` 会响应光照，但只计算漫反射，不产生明显高光。它的表面看起来比较柔和、偏哑光。

适合粗糙材质，比如墙面、布料、泥土、低成本建筑模型，或者不追求强真实感的简单场景。相比 `MeshPhongMaterial` 和 PBR 材质，它更轻量，但质感表达能力有限。

### MeshPhongMaterial

`MeshPhongMaterial` 在 Lambert 的基础上增加了镜面高光，可以通过 `shininess` 控制高光集中程度，通过 `specular` 控制高光颜色。

适合塑料、抛光陶瓷、简单金属感等需要高光但不要求物理准确的对象。它是传统光照模型，参数直观，但不如 PBR 材质适合真实材质还原。

### MeshStandardMaterial

`MeshStandardMaterial` 是 Three.js 中最常用的 PBR 材质。它用 `roughness` 表示粗糙度，用 `metalness` 表示金属程度，能和环境贴图、灯光配合得到更真实的效果。

适合大多数真实感模型，比如木头、石头、金属、塑料、皮革、建筑表面等。现代项目里，如果没有特殊原因，通常可以先从它开始。

### MeshPhysicalMaterial

`MeshPhysicalMaterial` 是 `MeshStandardMaterial` 的扩展，增加了更高级的物理效果，例如 `clearcoat`、`transmission`、`ior`、`thickness`、`sheen` 等。

适合更复杂的真实材质，比如汽车漆、玻璃、清漆木材、透明塑料、布料绒面等。它的表现力更强，但参数更多，性能成本也通常更高。只有当 `MeshStandardMaterial` 表达不够时再使用它更合适。

### MeshToonMaterial

`MeshToonMaterial` 会把光照结果处理成更明显的色阶，形成卡通化的明暗边界。

适合非写实项目，比如卡通角色、漫画风场景、低多边形风格展示。它仍然受灯光影响，所以灯光方向和强度会影响最终的卡通明暗。

### MeshNormalMaterial

`MeshNormalMaterial` 用模型表面的法线方向直接生成颜色，不依赖灯光，也不强调真实材质。

它主要适合调试：检查模型法线是否反了、表面方向是否连续、几何体是否有异常。正式产品画面中也可以作为一种特殊视觉风格，但它本质上不是模拟真实材质。

### MeshDepthMaterial

`MeshDepthMaterial` 根据物体到相机的距离显示深浅。离相机近和远的部分会呈现不同明暗。

它常用于深度相关的技术效果，比如景深、雾效、遮罩、阴影辅助或调试相机深度范围。一般不作为最终模型材质直接展示，除非刻意追求深度可视化效果。

### MeshMatcapMaterial

`MeshMatcapMaterial` 通过一张 matcap 贴图模拟材质和光照关系，不依赖场景灯光。模型旋转时质感会随法线变化，但光照方向是由贴图预先决定的。

适合快速展示模型质感、雕刻软件风格预览、作品集模型展示，或者移动端中需要低成本质感的场景。缺点是它不响应真实灯光，和场景里的动态光源不一致。

### Wireframe

`wireframe` 不是独立材质类型，而是材质上的一种显示模式。示例中使用的是开启 `wireframe: true` 的 `MeshBasicMaterial`。

适合观察几何体三角面、模型拓扑、细分密度和变形结果。它常用于调试或教学，不适合表达真实物体表面。

## 选择建议

需要简单纯色、不想受灯光影响时，用 `MeshBasicMaterial`。

需要低成本、柔和受光的粗糙表面时，用 `MeshLambertMaterial`。

需要传统高光效果，但不追求物理准确时，用 `MeshPhongMaterial`。

需要真实感材质时，优先用 `MeshStandardMaterial`。

需要玻璃、车漆、清漆、透光等高级效果时，用 `MeshPhysicalMaterial`。

需要卡通风格时，用 `MeshToonMaterial`。

需要调试几何法线或深度时，用 `MeshNormalMaterial` 或 `MeshDepthMaterial`。

需要不依赖灯光也能快速得到稳定质感时，用 `MeshMatcapMaterial`。
