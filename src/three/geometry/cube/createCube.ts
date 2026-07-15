import * as THREE from 'three';

type CubeFaceConfig = {
  number: number;
  backgroundColor: string;
  textColor: string;
};

/**
 * BoxGeometry 接收材质数组时，材质会按下面这个顺序贴到 6 个面上：
 *
 * 1. +X：右面
 * 2. -X：左面
 * 3. +Y：上面
 * 4. -Y：下面
 * 5. +Z：前面
 * 6. -Z：后面
 *
 * 所以这里配置的数组顺序，也就是数字 1~6 最终对应的面顺序。
 */
const CUBE_FACE_CONFIGS: CubeFaceConfig[] = [
  { number: 1, backgroundColor: '#e4572e', textColor: '#ffffff' },
  { number: 2, backgroundColor: '#17bebb', textColor: '#082f49' },
  { number: 3, backgroundColor: '#ffc914', textColor: '#3f2a00' },
  { number: 4, backgroundColor: '#2e282a', textColor: '#ffffff' },
  { number: 5, backgroundColor: '#76b041', textColor: '#102a0b' },
  { number: 6, backgroundColor: '#5c4dff', textColor: '#ffffff' },
];

/**
 * 为立方体的单个面创建一张 CanvasTexture。
 *
 * Three.js 的材质可以直接使用图片，也可以使用 canvas。
 * 这里选择 canvas 的好处是：不需要额外准备 png/jpg 文件，
 * 代码里就能动态画出“底色 + 数字”，再把它变成贴图贴到立方体表面。
 */
function createCubeFaceTexture({ number, backgroundColor, textColor }: CubeFaceConfig) {
  const size = 512;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('当前浏览器不支持 Canvas 2D，无法创建立方体数字贴图。');
  }

  canvas.width = size;
  canvas.height = size;

  // 先填充整个面的背景色，这就是立方体当前面的主色。
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, size, size);

  /**
   * 给贴图加一点边框和内阴影，旋转时更容易看出每个面是独立的。
   * 这些都是画在 canvas 上的 2D 像素，最后会随贴图一起贴到 3D 面上。
   */
  context.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  context.lineWidth = 24;
  context.strokeRect(24, 24, size - 48, size - 48);

  context.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  context.lineWidth = 12;
  context.strokeRect(54, 54, size - 108, size - 108);

  /**
   * 绘制居中的数字。
   *
   * textAlign = 'center' 让文字的 x 坐标表示“文字中心点”。
   * textBaseline = 'middle' 让文字的 y 坐标表示“文字垂直中心点”。
   * 这样 fillText(number, size / 2, size / 2) 就能把数字画在正中央。
   */
  context.fillStyle = textColor;
  context.font = 'bold 260px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(String(number), size / 2, size / 2 + 8);

  const texture = new THREE.CanvasTexture(canvas);

  /**
   * Canvas 里的颜色通常按 sRGB 理解。
   * 显式设置 colorSpace 可以让贴图颜色在 Three.js 中更接近 canvas 上画出的颜色。
   */
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

/**
 * 创建一个立方体对象。
 *
 * 在 Three.js 中，一个能显示出来的物体通常由两部分组成：
 * 1. geometry：几何体，决定形状，比如立方体、球体、平面。
 * 2. material：材质，决定外观，比如颜色、是否受灯光影响、金属感等。
 *
 * Mesh 会把 geometry 和 material 组合起来，变成可以添加到 scene 的 3D 对象。
 */
export function createCube() {
  // BoxGeometry(width, height, depth)：创建宽高深都为 1 的立方体几何形状。
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  /**
   * 每个面的贴图都对应一个 MeshBasicMaterial。
   *
   * MeshBasicMaterial 是最简单的材质，它不受灯光影响。
   * 这对初学示例很友好：即使场景里没有 Light，也能直接看到颜色和数字。
   */
  const faceTextures = CUBE_FACE_CONFIGS.map(createCubeFaceTexture);
  const materials = faceTextures.map((texture) => new THREE.MeshBasicMaterial({ map: texture }));

  /**
   * Mesh 是真正放进场景里的对象。后续旋转、移动、缩放也都是操作这个 mesh。
   *
   * 第二个参数传材质数组时，BoxGeometry 会把数组里的 6 个材质分别应用到 6 个面。
   * 这就是“每个面不同颜色、不同数字”的关键。
   */
  const mesh = new THREE.Mesh(geometry, materials);

  /**
   * 稍微给立方体一个初始角度。
   * 如果完全正对相机，第一眼只能看到一个面；倾斜一点能同时看到前、右、上几个面。
   */
  mesh.rotation.set(-0.35, 0.55, 0);

  return {
    mesh,
    dispose: () => {
      /**
       * geometry、material、texture 都会占用 GPU 资源。
       * React 组件卸载时需要手动 dispose，避免页面切换或热更新后资源泄漏。
       */
      geometry.dispose();
      materials.forEach((material) => {
        material.dispose();
      });
      faceTextures.forEach((texture) => {
        texture.dispose();
      });
    },
  };
}

export type Cube = ReturnType<typeof createCube>;
