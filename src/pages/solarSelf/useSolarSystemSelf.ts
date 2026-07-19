import { type RefObject, useEffect } from 'react';
import {
  AmbientLight,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  Vector3,
  WebGLRenderer,
} from 'three';
import earthTextureUrl from '../solarSystem/assets/earth.jpeg';
import moonTextureUrl from '../solarSystem/assets/moon.png';
import sunTextureUrl from '../solarSystem/assets/sun.jpeg';

// 初始视角是“太阳系总览构图”：视线中心在太阳和地球之间。
// 这样首屏能同时看到太阳、地球、月球，而不是只盯着某一个天体。
const INITIAL_VIEW = {
  target: new Vector3(10, 0, 0),
  cameraPosition: new Vector3(10, 24, 56),
};

/**
 * 创建太阳-地球-月亮三星系统
 * @param canvas
 */
function createSolarSystemScene(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // renderer.setClearColor()

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  // 世界容器
  const scene = new Scene();

  const camera = new PerspectiveCamera(50, 1, 0.1, 300);
  camera.position.copy(INITIAL_VIEW.cameraPosition);
  camera.lookAt(INITIAL_VIEW.target);

  // 用来计算每一帧和上一帧之间经过了多少秒。
  const timer = new Timer();

  // 纹理加载器
  const textureLoader = new TextureLoader();
  const sunTexture = textureLoader.load(sunTextureUrl);
  const moonTexture = textureLoader.load(moonTextureUrl);
  const earthTexture = textureLoader.load(earthTextureUrl);
  timer.connect(document);

  // 颜色贴图按 sRGB 解读，避免在 Three.js 线性空间里显示得发灰或偏暗。
  sunTexture.colorSpace = SRGBColorSpace;
  earthTexture.colorSpace = SRGBColorSpace;
  moonTexture.colorSpace = SRGBColorSpace;

  // 使用当前设备支持的最高各向异性过滤等级，让球体贴图在远处或斜视角下更清晰。
  sunTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  moonTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const solarSystem = new Group();
  const earthRotateGroup = new Group();
  const earthGroup = new Group();
  const moonRotateGroup = new Group();
  const moonGroup = new Group();

  const sun = new Mesh(
    new SphereGeometry(8, 64, 32),
    new MeshBasicMaterial({
      color: 0xffffff,
      map: sunTexture,
    }),
  );

  const earth = new Mesh(
    new SphereGeometry(1.25, 48, 24),
    new MeshStandardMaterial({
      color: 0xffffff,
      map: earthTexture,
      roughness: 0.62,
      metalness: 0,
      emissive: 0x020617,
    }),
  );

  const moon = new Mesh(
    new SphereGeometry(0.36, 32, 16),
    new MeshStandardMaterial({
      color: 0xffffff,
      map: moonTexture,
      roughness: 0.78,
      metalness: 0,
    }),
  );

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

  earthGroup.position.set(24, 0, 0);
  moonGroup.position.set(3.1, 0, 0);
  earthGroup.rotation.z = MathUtils.degToRad(23.5);

  moonGroup.add(moon);
  moonRotateGroup.add(moonGroup);

  earthGroup.add(earth);

  earthGroup.add(moonRotateGroup);

  earthRotateGroup.add(earthGroup);

  solarSystem.add(sun);
  solarSystem.add(earthRotateGroup);

  scene.add(solarSystem);
  // scene.add();

  scene.add(sunLight);
  scene.add(ambientLight);

  const render = (timestamp?: number) => {
    timer.update(timestamp);
    // delta 是“这一帧距离上一帧过去了多少秒”，用它能让动画速度不依赖帧率。
    const delta = timer.getDelta();

    sun.rotation.y += delta * 0.05;
    earth.rotation.y += delta * 0.28;
    moon.rotation.y += delta * 0.1;

    earthRotateGroup.rotation.y += delta * 0.035;
    moonRotateGroup.rotation.y += delta * 0.24;

    renderer.render(scene, camera);
  };

  const resize = () => {
    // canvas 的 CSS 尺寸变化时，需要同步更新 WebGL 实际绘制尺寸和相机宽高比。
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const handleDoubleClick = () => {};

  resize();
  renderer.setAnimationLoop(render);
  window.addEventListener('resize', resize);
  canvas.addEventListener('dblclick', handleDoubleClick);

  return {
    /**
     * 清理函数，threeJs有些对象要手动dispose释放GPU占用的资源
     */
    dispose: () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      renderer.setAnimationLoop(null);
      timer.disconnect();
      timer.dispose();

      renderer.dispose();
    },
  };
}

export function useSolarSystemSelf(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const solarSystemScene = createSolarSystemScene(canvas);

    return () => {
      solarSystemScene.dispose();
    };
  }, [canvasRef]);
}
