import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Float32BufferAttribute,
  GridHelper,
  HemisphereLight,
  Light,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PolyhedronGeometry,
  Scene,
  SphereGeometry,
  SpotLight,
  TorusGeometry,
  WebGLRenderer,
} from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { LightState, LightType } from './types';

type LightSet = Record<LightType, Light>;

type StressBoxes = {
  dispose: () => void;
};

const FACE_COLORS = [
  0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x14b8a6, 0x38bdf8, 0x6366f1, 0xa855f7, 0xec4899,
  0xf43f5e, 0x84cc16, 0x06b6d4,
];

/**
 * 创建 WebGLRenderer。
 *
 * renderer 负责把 scene + camera 的结果绘制到页面 canvas 上。
 */
function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({
    antialias: true,
    canvas,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x111827);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  return renderer;
}

/**
 * 创建观察整个灯光演示场景的透视相机。
 */
function createCamera() {
  const camera = new PerspectiveCamera(55, 1, 0.1, 200);

  camera.position.set(16, 12, 18);
  camera.lookAt(0, 1, 0);

  return camera;
}

/**
 * 创建相机控制器。
 *
 * maxPolarAngle 限制相机最多旋转到接近水平视角，避免拖到地面以下。
 */
function createControls(camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
  const controls = new OrbitControls(camera, canvas);

  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 8;
  controls.maxDistance = 48;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.update();

  return controls;
}

/**
 * 创建性能监控面板。
 *
 * stats.js 会显示 FPS、单帧耗时等信息，适合观察光源、阴影、物体数量变化后的性能影响。
 */
function createStats(container: HTMLElement) {
  const stats = new Stats();

  // setMode(0) 显示 FPS；点击面板可以切换到 MS、MB 等模式。
  stats.setMode(0);
  stats.domElement.classList.add('light-demo-stats');
  container.appendChild(stats.domElement);

  return stats;
}

/**
 * 创建演示用的五类光源。
 *
 * 每个光源都放进 LightSet，后续按钮只需要控制对应 light.visible。
 */
function createLights(): LightSet {
  // 环境光：均匀照亮所有受光材质，不产生方向和阴影。
  const ambient = new AmbientLight(0xffffff, 1);

  // 方向光：类似太阳光，适合做主光和阴影。
  const directional = new DirectionalLight(0xffffff, 1.5);
  directional.position.set(-10, 14, 8);
  directional.castShadow = true;
  directional.shadow.mapSize.set(1024, 1024);
  directional.shadow.camera.near = 1;
  directional.shadow.camera.far = 50;
  directional.shadow.camera.left = -16;
  directional.shadow.camera.right = 16;
  directional.shadow.camera.top = 16;
  directional.shadow.camera.bottom = -16;

  // 点光源：从一个点向四周发光，适合模拟灯泡、火光等局部光。
  const point = new PointLight(0xff7a45, 2, 45);
  point.position.set(0, 0, 6);
  point.castShadow = true;

  // 聚光灯：只照亮一个锥形区域，类似手电筒或舞台灯。
  const spot = new SpotLight(0x7dd3fc, 2.5, 60, Math.PI / 7, 0.35, 1);
  spot.position.set(0, 14, -10);
  spot.target.position.set(0, 0, 0);
  spot.castShadow = true;

  // 半球光：有天空色和地面色，适合做户外环境补光，不投射阴影。
  const hemisphere = new HemisphereLight(0x8ec5ff, 0x2f3a24, 0.9);

  return {
    ambient,
    directional,
    point,
    spot,
    hemisphere,
  };
}

/**
 * 创建演示用物体。
 *
 * MeshStandardMaterial 会受灯光影响，因此适合观察不同 Light 的效果。
 */
function createHexadecahedronGeometry(radius: number) {
  const vertices: number[] = [0, 1, 0, 0, -1, 0];
  const indices: number[] = [];

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;

    vertices.push(Math.cos(angle), 0, Math.sin(angle));
  }

  for (let i = 0; i < 8; i++) {
    const current = i + 2;
    const next = ((i + 1) % 8) + 2;

    indices.push(0, current, next);
    indices.push(1, next, current);
  }

  return new PolyhedronGeometry(vertices, indices, radius, 0);
}

function createFaceColoredPyramid(radialSegments: number) {
  const geometry = new ConeGeometry(1.45, 2.8, radialSegments).toNonIndexed();
  const position = geometry.getAttribute('position');
  const colors: number[] = [];

  for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex++) {
    const faceIndex = Math.floor(vertexIndex / 3);
    const color = new Color(FACE_COLORS[faceIndex % FACE_COLORS.length]);

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

  return new Mesh(
    geometry,
    new MeshStandardMaterial({
      roughness: 0.42,
      metalness: 0.08,
      vertexColors: true,
    }),
  );
}

function createObjects() {
  const blueMaterial = new MeshStandardMaterial({
    color: 0x4f9cff,
    roughness: 0.35,
    metalness: 0.18,
  });
  const orangeMaterial = new MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.42,
    metalness: 0.08,
  });
  const greenMaterial = new MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.45,
    metalness: 0.05,
  });
  const violetMaterial = new MeshStandardMaterial({
    color: 0xa78bfa,
    roughness: 0.38,
    metalness: 0.12,
  });
  const groundMaterial = new MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.9,
    metalness: 0,
  });

  const cube = new Mesh(new BoxGeometry(2.6, 2.6, 2.6), blueMaterial);
  const sphere = new Mesh(new SphereGeometry(1.35, 48, 24), orangeMaterial);
  const cone = new Mesh(new ConeGeometry(1.35, 3, 48), greenMaterial);
  const cylinder = new Mesh(new CylinderGeometry(1.25, 1.25, 2.8, 48), violetMaterial);
  const octahedron = new Mesh(new OctahedronGeometry(1.6), blueMaterial.clone());
  const hexadecahedron = new Mesh(createHexadecahedronGeometry(1.6), orangeMaterial.clone());
  const hemisphere = new Mesh(
    new SphereGeometry(1.45, 48, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    greenMaterial.clone(),
  );
  const torus = new Mesh(new TorusGeometry(1.05, 0.32, 24, 72), violetMaterial.clone());
  const dodecahedron = new Mesh(new DodecahedronGeometry(1.45), blueMaterial.clone());
  const capsule = new Mesh(new CapsuleGeometry(0.8, 1.7, 12, 24), orangeMaterial.clone());
  const triangularPyramid = createFaceColoredPyramid(3);
  const squarePyramid = createFaceColoredPyramid(4);
  const pentagonalPyramid = createFaceColoredPyramid(5);
  const hexagonalPyramid = createFaceColoredPyramid(6);
  const ground = new Mesh(new PlaneGeometry(48, 48), groundMaterial);
  const displayMeshes = [
    cube,
    sphere,
    cone,
    cylinder,
    octahedron,
    hexadecahedron,
    hemisphere,
    torus,
    dodecahedron,
    capsule,
    triangularPyramid,
    squarePyramid,
    pentagonalPyramid,
    hexagonalPyramid,
  ];

  // 多个典型几何体分三排摆放，方便观察不同形状上的明暗、高光和阴影。
  cube.position.set(-9, 1.3, -4);
  sphere.position.set(-5, 1.35, -4);
  cone.position.set(-1, 1.5, -4);
  cylinder.position.set(3, 1.4, -4);
  octahedron.position.set(7, 1.6, -4);
  hexadecahedron.position.set(-9, 1.6, 4);
  hemisphere.position.set(-5, 0, 4);
  torus.position.set(-1, 1.35, 4);
  dodecahedron.position.set(3, 1.45, 4);
  capsule.position.set(7, 1.65, 4);
  triangularPyramid.position.set(-6, 1.4, 11);
  squarePyramid.position.set(-2, 1.4, 11);
  pentagonalPyramid.position.set(2, 1.4, 11);
  hexagonalPyramid.position.set(6, 1.4, 11);
  ground.rotation.x = -Math.PI / 2;

  // 这些 Mesh 使用受光材质，既投射阴影，也能接收阴影。
  displayMeshes.forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });

  // 地面只需要接收阴影，用来观察光源方向和阴影强弱。
  ground.receiveShadow = true;

  return {
    meshes: [...displayMeshes, ground],
    dispose: () => {
      [...displayMeshes, ground].forEach((mesh) => {
        mesh.geometry.dispose();
        const meshMaterial = mesh.material;

        if (Array.isArray(meshMaterial)) {
          meshMaterial.forEach((currentMaterial) => {
            currentMaterial.dispose();
          });
          return;
        }

        meshMaterial.dispose();
      });
    },
  };
}

/**
 * 随机创建一批长方体，用来观察模型数量增加后 Stats 面板的 FPS/MS 变化。
 */
function createStressBoxes(scene: Scene, count: number): StressBoxes {
  const geometry = new BoxGeometry(5, 5, 5);
  const material = new MeshLambertMaterial({
    color: 0x00ffff,
  });
  const meshes: Mesh[] = [];

  for (let i = 0; i < count; i++) {
    const mesh = new Mesh(geometry, material);
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;

    mesh.position.set(x, y, z);
    scene.add(mesh);
    meshes.push(mesh);
  }

  return {
    dispose: () => {
      meshes.forEach((mesh) => {
        scene.remove(mesh);
      });
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * 把 React 中的开关状态同步到 Three.js Light.visible。
 */
function applyLightState(lights: LightSet, lightState: LightState) {
  Object.entries(lightState).forEach(([type, visible]) => {
    lights[type as LightType].visible = visible;
  });
}

/**
 * 创建完整的灯光演示场景，并返回外部可调用的控制接口。
 *
 * React 侧只需要调用 setLightState 和 dispose，不直接操作 Three.js 内部对象。
 */
export function createLightDemoScene(
  canvas: HTMLCanvasElement,
  initialLightState: LightState,
  initialStressBoxCount: number,
) {
  const renderer = createRenderer(canvas);
  const scene = new Scene();
  const camera = createCamera();
  const controls = createControls(camera, canvas);
  const stats = createStats(canvas.parentElement ?? document.body);
  const lights = createLights();
  const objects = createObjects();
  const gridHelper = new GridHelper(48, 24);
  const axesHelper = new AxesHelper(8);
  let stressBoxes = createStressBoxes(scene, initialStressBoxCount);

  // 初始化时先应用一次 UI 状态，保证第一帧就是正确的光源开关组合。
  applyLightState(lights, initialLightState);

  // SpotLight 的 target 也要加入场景，否则目标点的世界矩阵不会参与更新。
  Object.values(lights).forEach((light) => {
    scene.add(light);
  });
  scene.add((lights.spot as SpotLight).target);
  objects.meshes.forEach((mesh) => {
    scene.add(mesh);
  });
  scene.add(gridHelper);
  scene.add(axesHelper);

  // 同步 canvas 的 CSS 尺寸、renderer 绘制尺寸和 camera 宽高比。
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  // 每一帧先更新控制器，再渲染最新相机视角，最后刷新 Stats 统计结果。
  const render = () => {
    controls.update();
    renderer.render(scene, camera);
    stats.update();
  };

  resize();
  renderer.setAnimationLoop(render);
  window.addEventListener('resize', resize);

  return {
    setLightState: (lightState: LightState) => {
      applyLightState(lights, lightState);
    },
    setStressBoxCount: (count: number) => {
      stressBoxes.dispose();
      stressBoxes = createStressBoxes(scene, count);
    },
    dispose: () => {
      // 停止动画循环和窗口监听，避免页面卸载后继续渲染。
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);

      // Three.js 资源通常会占用 GPU 内存，需要显式释放。
      stats.domElement.remove();
      controls.dispose();
      stressBoxes.dispose();
      objects.dispose();
      gridHelper.dispose();
      axesHelper.dispose();
      renderer.dispose();
    },
  };
}
