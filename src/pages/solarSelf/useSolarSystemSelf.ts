import { type RefObject, useEffect } from 'react';
import {
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
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

  const render = (timestamp?: number) => {
    timer.update(timestamp);
    // delta 是“这一帧距离上一帧过去了多少秒”，用它能让动画速度不依赖帧率。
    // const delta = timer.getDelta();

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
