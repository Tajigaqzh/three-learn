import {
  AmbientLight,
  BufferGeometry,
  EllipseCurve,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MOUSE,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import earthTextureUrl from './assets/earth.jpeg';
import moonTextureUrl from './assets/moon.png';
import sunTextureUrl from './assets/sun.jpeg';

// 这里使用的是“演示比例”，不是天文学真实比例。
// 真实太阳比地球大太多，如果完全按真实比例显示，地球和月球会几乎看不见。
const BODY_SIZE = {
  sunRadius: 7.2,
  earthRadius: 1.25,
  moonRadius: 0.36,
};

// 公转半径同样是演示值：让太阳、地球、月球在一个屏幕里都能看清。
const ORBIT_RADIUS = {
  earth: 24,
  moon: 3.1,
};

// 自转速度，单位可以理解成“每秒旋转多少弧度”的近似值。
// 数值越大，贴图转得越快。
const ROTATION_SPEED = {
  sun: 0.05,
  earth: 0.28,
  moon: 0.1,
};

// 公转速度：地球绕太阳转，月球绕地球转。
// 这里刻意放慢，方便观察贴图和相对运动关系。
const ORBIT_SPEED = {
  earth: 0.035,
  moon: 0.24,
};

// 双击天体时，相机离对应天体的距离。
// 太阳体积大，需要离远一些；月球小，可以靠近一些。
const FOCUS_DISTANCE = {
  sun: 44,
  earth: 8,
  moon: 2.6,
};

// 初始视角是“太阳系总览构图”：视线中心在太阳和地球之间。
// 这样首屏能同时看到太阳、地球、月球，而不是只盯着某一个天体。
const INITIAL_VIEW = {
  target: new Vector3(10, 0, 0),
  cameraPosition: new Vector3(10, 24, 56),
};

/**
 * 创建 WebGL 渲染器，并绑定到 React 页面传入的 canvas。
 *
 * 渲染器负责把 Three.js 场景真正绘制到浏览器画布上。
 */
function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({
    antialias: true,
    canvas,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020617);
  // 开启阴影后，地球和月球可以互相投射/接收阴影，光照关系更清楚。
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  return renderer;
}

/**
 * 创建初始相机。
 *
 * 相机的位置和朝向使用 INITIAL_VIEW，形成能同时看到太阳、地球、月球的总览视角。
 */
function createCamera() {
  const camera = new PerspectiveCamera(50, 1, 0.1, 300);

  camera.position.copy(INITIAL_VIEW.cameraPosition);
  camera.lookAt(INITIAL_VIEW.target);

  return camera;
}

/**
 * 创建用户交互控制器。
 *
 * OrbitControls 负责鼠标拖拽、滚轮缩放、旋转和平移视口。
 */
function createControls(camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
  const controls = new OrbitControls(camera, canvas);

  // OrbitControls 的 target 是“相机围绕/平移参考的中心点”。
  // 初始放在太阳和地球之间，形成太阳系总览视角。
  controls.target.copy(INITIAL_VIEW.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.minDistance = 1.2;
  controls.maxDistance = 130;
  // 交互约定：
  // 1. 直接左键拖拽：平移视口。
  // 2. 按住 Ctrl/Meta/Shift 再左键拖拽：OrbitControls 会临时切换为旋转。
  // 3. 右键拖拽：旋转。
  // 4. 滚轮：缩放。
  controls.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  controls.update();

  return controls;
}

/**
 * 创建一条圆形轨道线。
 *
 * @param radius 轨道半径。
 * @param color 轨道线颜色。
 * @returns 可添加到场景中的闭合线条对象。
 */
function createOrbitRing(radius: number, color: number) {
  // EllipseCurve 用来描述一个二维椭圆曲线。
  // 参数含义：
  // 1. 前两个 0, 0：椭圆中心点在局部坐标系的 (0, 0)。
  // 2. radius, radius：X 方向半径和 Y 方向半径相同，所以它实际是一个圆。
  // 这里先在 XY 平面创建圆，是因为 EllipseCurve 本身生成的是二维点。
  const curve = new EllipseCurve(0, 0, radius, radius);

  // getPoints(160) 表示沿着圆周取 160 个点。
  // 点越多，轨道线越圆滑；点越少，轨道线越像多边形。
  // 160 对当前场景已经足够平滑，也不会产生明显性能负担。
  const points = curve.getPoints(160);

  // BufferGeometry 是 Three.js 里高性能的几何体格式。
  // setFromPoints 会把上面采样得到的一组点转换成 GPU 可以绘制的顶点数据。
  const geometry = new BufferGeometry().setFromPoints(points);

  // LineBasicMaterial 是专门给线条用的基础材质。
  // transparent + opacity 让轨道线半透明，不会抢走太阳、地球、月球的视觉重点。
  const material = new LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.45,
  });

  // LineLoop 会按照点的顺序连线，并自动把最后一个点连回第一个点。
  // 这样就形成了一条闭合的圆形轨道线。
  const ring = new LineLoop(geometry, material);

  // EllipseCurve 生成的圆默认躺在 XY 平面，也就是像一张竖起来的纸。
  // 太阳系里地球绕太阳运动主要发生在 XZ 平面，所以这里绕 X 轴旋转 90 度。
  // Math.PI / 2 就是 90 度的弧度值。
  ring.rotation.x = Math.PI / 2;

  return ring;
}

/**
 * 创建星空背景。
 *
 * 星星由一批随机分布在远处的点组成，不参与动画和光照。
 */
function createStars() {
  const geometry = new BufferGeometry();
  const positions: number[] = [];

  // 随机生成一批较远的点，作为静态星空背景。
  for (let i = 0; i < 600; i++) {
    const radius = 90 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

  const material = new PointsMaterial({
    color: 0xe5e7eb,
    size: 0.36,
    sizeAttenuation: true,
  });

  return new Points(geometry, material);
}

/**
 * 创建太阳系 Three.js 场景，并返回清理函数。
 *
 * 这个函数会完成场景初始化、贴图加载、天体层级组织、动画循环和事件监听。
 */
export function createSolarSystemScene(canvas: HTMLCanvasElement) {
  // 创建 Three.js 场景所需的核心对象：
  // renderer 负责画面输出，scene 是世界容器，camera 是观察这个世界的相机。
  const renderer = createRenderer(canvas);
  const scene = new Scene();
  const camera = createCamera();
  const controls = createControls(camera, canvas);

  // Timer 替代已废弃的 Clock，用来计算每一帧和上一帧之间经过了多少秒。
  const timer = new Timer();

  // raycaster 用于“鼠标点选 3D 物体”。
  // 双击画布时，会用它判断用户点中了太阳、地球还是月球。
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const targetPosition = new Vector3();
  const viewDirection = new Vector3();

  // Vite 会把 import 进来的图片转换成最终可访问的资源 URL。
  // TextureLoader 再把这些 URL 加载成 Three.js 可用的纹理对象。
  const textureLoader = new TextureLoader();
  const sunTexture = textureLoader.load(sunTextureUrl);
  const earthTexture = textureLoader.load(earthTextureUrl);
  const moonTexture = textureLoader.load(moonTextureUrl);

  timer.connect(document);

  // PNG 贴图按 sRGB 解读，避免在 Three.js 线性空间里显示得发灰或偏暗。
  sunTexture.colorSpace = SRGBColorSpace;
  earthTexture.colorSpace = SRGBColorSpace;
  moonTexture.colorSpace = SRGBColorSpace;
  sunTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  moonTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Group 是“空的 3D 容器”，常用来组织父子关系和统一变换。
  // 注意：earthOrbitPivot / moonOrbitPivot 不是轨迹线，而是公转用的“旋转支点容器”。
  // 真正画出来的轨道线是 earthOrbitRing / moonOrbitRing。
  //
  // 这里的层级关系是：
  // solarSystem 整个太阳-地球-月球系统
  //   sun 太阳
  //   earthOrbitPivot 地球公转支点容器，旋转它可以带着地球组绕太阳转
  //     earthGroup 地球组，地球、月球公转支点、月球轨道线都跟着它走
  //       earth 地球
  //       moonOrbitPivot 月球公转支点容器，旋转它可以带着月球组绕地球转
  //         moonGroup 月球组
  //           moon 月球
  //       moonOrbitRing 月球轨道线，只负责显示月球绕地球的轨道
  //
  // earthOrbitRing 是地球轨道线，直接加到 scene 里，固定显示在太阳周围。
  const solarSystem = new Group();
  const earthOrbitPivot = new Group();
  const earthGroup = new Group();
  const moonOrbitPivot = new Group();
  const moonGroup = new Group();

  const sun = new Mesh(
    new SphereGeometry(BODY_SIZE.sunRadius, 64, 32),
    new MeshBasicMaterial({
      color: 0xffffff,
      map: sunTexture,
    }),
  );
  const earth = new Mesh(
    new SphereGeometry(BODY_SIZE.earthRadius, 48, 24),
    new MeshStandardMaterial({
      color: 0xffffff,
      map: earthTexture,
      roughness: 0.62,
      metalness: 0,
      emissive: 0x020617,
    }),
  );
  const moon = new Mesh(
    new SphereGeometry(BODY_SIZE.moonRadius, 32, 16),
    new MeshStandardMaterial({
      color: 0xffffff,
      map: moonTexture,
      roughness: 0.78,
      metalness: 0,
    }),
  );
  const earthOrbitRing = createOrbitRing(ORBIT_RADIUS.earth, 0x38bdf8);
  const moonOrbitRing = createOrbitRing(ORBIT_RADIUS.moon, 0x94a3b8);
  const stars = createStars();

  // 太阳作为点光源，从中心向四周发光；地球和月球的亮面都由这个光源决定。
  const sunLight = new PointLight(0xffffff, 2600, 180, 2);
  const ambientLight = new AmbientLight(0x1e293b, 0.25);

  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 120;

  earth.castShadow = true;
  earth.receiveShadow = true;
  moon.castShadow = true;
  moon.receiveShadow = true;

  // 地球先放到自己的公转半径上。
  // 注意：这里移动的是 earthGroup，不是 earth 本身，因为月球也要跟着地球一起移动。
  earthGroup.position.set(ORBIT_RADIUS.earth, 0, 0);

  // 月球放到地球附近的月球轨道半径上。
  // 同理，移动 moonGroup 可以保留后续扩展空间，比如给月球加标签或辅助线。
  moonGroup.position.set(ORBIT_RADIUS.moon, 0, 0);

  // 地球自转轴倾斜约 23.5 度，让视觉效果更接近真实地球。
  earthGroup.rotation.z = MathUtils.degToRad(23.5);

  // 按父子关系把对象装进 Group。
  // 这部分顺序决定了“谁跟着谁一起动”。
  moonGroup.add(moon);
  moonOrbitPivot.add(moonGroup);
  earthGroup.add(earth);
  earthGroup.add(moonOrbitPivot);
  earthGroup.add(moonOrbitRing);
  earthOrbitPivot.add(earthGroup);
  solarSystem.add(sun);
  solarSystem.add(earthOrbitPivot);
  scene.add(solarSystem);
  scene.add(earthOrbitRing);
  scene.add(stars);
  scene.add(sunLight);
  scene.add(ambientLight);

  /**
   * 同步 canvas 尺寸和相机宽高比。
   *
   * 浏览器窗口变化后，如果不更新 renderer 和 camera，画面会变形或分辨率不正确。
   */
  const resize = () => {
    // canvas 的 CSS 尺寸变化时，需要同步更新 WebGL 实际绘制尺寸和相机宽高比。
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  /**
   * 双击天体后，把相机一次性移动到该天体附近。
   *
   * 这里不会持续绑定目标天体，所以跳转后用户仍然可以自由平移、旋转和缩放。
   */
  const focusObject = (object: Object3D, distance?: number) => {
    object.getWorldPosition(targetPosition);
    // 只做一次性跳转：移动相机和 OrbitControls target，不把视口持续绑定到天体。
    // getWorldPosition 能拿到天体在整个场景里的真实位置，即使它被放在多层 Group 里面。
    viewDirection.copy(camera.position).sub(controls.target).normalize();
    camera.position
      .copy(targetPosition)
      .addScaledVector(viewDirection, distance ?? camera.position.distanceTo(controls.target));
    controls.target.copy(targetPosition);
    controls.update();
  };

  /**
   * 根据天体大小返回合适的双击观察距离。
   */
  const getFocusDistance = (object: Object3D) => {
    // 不同天体半径不同，双击聚焦时需要不同观察距离。
    if (object === sun) return FOCUS_DISTANCE.sun;
    if (object === earth) return FOCUS_DISTANCE.earth;
    return FOCUS_DISTANCE.moon;
  };

  /**
   * 处理画布双击事件。
   *
   * 把鼠标位置转换成 Three.js 射线，判断用户双击的是太阳、地球还是月球。
   */
  const handleDoubleClick = (event: MouseEvent) => {
    const bounds = canvas.getBoundingClientRect();

    // 浏览器鼠标坐标要转换成 Three.js 射线需要的 NDC 坐标：
    // x/y 都在 -1 到 1 之间，画布中心是 (0, 0)。
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    // 从相机向鼠标位置发射一条射线，找出最先被点中的天体。
    const [intersection] = raycaster.intersectObjects([sun, earth, moon]);

    if (intersection) {
      focusObject(intersection.object, getFocusDistance(intersection.object));
    }
  };

  /**
   * 每一帧执行的渲染循环。
   *
   * 这里更新自转、公转、控制器阻尼状态，然后重新绘制场景。
   */
  const render = (timestamp?: number) => {
    // setAnimationLoop 每帧都会调用 render。
    // delta 是“这一帧距离上一帧过去了多少秒”，用它能让动画速度不依赖帧率。
    timer.update(timestamp);
    const delta = timer.getDelta();

    // 自转：使用演示速度，避免纹理在近距离观察时转得过快。
    sun.rotation.y += delta * ROTATION_SPEED.sun;
    earth.rotation.y += delta * ROTATION_SPEED.earth;
    moon.rotation.y += delta * ROTATION_SPEED.moon;

    // 公转：整体放慢，保留层级关系但让用户有时间观察贴图细节。
    earthOrbitPivot.rotation.y += delta * ORBIT_SPEED.earth;
    moonOrbitPivot.rotation.y += delta * ORBIT_SPEED.moon;

    controls.update();
    renderer.render(scene, camera);
  };

  // 初始化一次尺寸，然后启动渲染循环和事件监听。
  resize();
  renderer.setAnimationLoop(render);
  window.addEventListener('resize', resize);
  canvas.addEventListener('dblclick', handleDoubleClick);

  return {
    /**
     * 清理 Three.js 场景占用的事件监听、动画循环和 GPU 资源。
     */
    dispose: () => {
      // React 页面卸载时会调用 dispose。
      // Three.js 里的 geometry/material/texture 不会自动释放，需要手动 dispose，避免显存泄漏。
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      renderer.setAnimationLoop(null);
      controls.dispose();
      timer.dispose();
      sun.geometry.dispose();
      earth.geometry.dispose();
      moon.geometry.dispose();
      earthOrbitRing.geometry.dispose();
      moonOrbitRing.geometry.dispose();
      stars.geometry.dispose();
      sun.material.dispose();
      earth.material.dispose();
      moon.material.dispose();
      sunTexture.dispose();
      earthTexture.dispose();
      moonTexture.dispose();
      earthOrbitRing.material.dispose();
      moonOrbitRing.material.dispose();
      stars.material.dispose();
      renderer.dispose();
    },
  };
}
