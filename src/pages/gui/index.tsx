import { useEffect, useRef } from 'react';
import {
  AxesHelper,
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Timer,
  WebGLRenderer,
} from 'three';

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    // 用来计算每一帧和上一帧之间经过了多少秒。
    const timer = new Timer();
    timer.connect(document);

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, 1, 0.1, 300);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    const box = new Mesh(
      new BoxGeometry(10, 10, 10),
      new MeshStandardMaterial({
        color: 0xfefefe,
        roughness: 0.5,
        metalness: 0,
      }),
    );

    const helper = new AxesHelper();
    scene.add(helper);

    scene.add(box);

    const render = (timestamp?: number) => {
      timer.update(timestamp);
      renderer.render(scene, camera);
    };

    const resize = () => {
      if (!canvasRef.current) return;
      // canvas 的 CSS 尺寸变化时，需要同步更新 WebGL 实际绘制尺寸和相机宽高比。
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener('resize', resize);
    renderer.setAnimationLoop(render);

    return () => {
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);
      timer.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="threeRoot"></canvas>;
};

export default Index;
