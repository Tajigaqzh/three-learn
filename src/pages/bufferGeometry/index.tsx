import { useEffect, useRef } from 'react';
import {
  AxesHelper,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Timer,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, 1, 0.1, 300);

    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    const material = new MeshStandardMaterial({
      color: 0xff0000,
    });
    //////////////////////////////////
    const box = new Mesh(new BoxGeometry(1, 1, 1), material);

    // scene.add(box);
    ///////////////////////////////////////

    //创建一个空的几何体对象
    const geometry = new BufferGeometry();

    // const vertices = new Float32Array([
    //   0, 0, 0, //顶点1坐标
    //   40, 0, 0, //顶点2坐标
    //   40, 40, 0, //顶点3坐标
    //   0, 0, 0, //顶点4坐标   和顶点1位置相同
    //   40, 40, 0, //顶点5坐标  和顶点3位置相同
    //   0, 40, 0, //顶点6坐标
    // ]);

    // Uint16Array类型数组创建顶点索引数据
    const indexes = new Uint16Array([
      // 下面索引值对应顶点位置数据中的顶点坐标
      0, 1, 2, 0, 2, 3,
    ]);

    // 创建属性缓冲区对象
    //3个为一组，表示一个顶点的xyz坐标
    // 设置几何体attributes属性的位置属性
    geometry.attributes.position = new BufferAttribute(indexes, 3);

    const box2 = new Mesh(geometry, material);

    scene.add(box2);

    ///////////////////////////////////
    const controls = new OrbitControls(camera, canvas);

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.update();

    const light = new DirectionalLight(0xffffff, 1);

    light.position.set(5, 0, 5);

    const gridHelper = new GridHelper(20, 20);
    const axesHelper = new AxesHelper(10);

    // 用来计算每一帧和上一帧之间经过了多少秒。
    const timer = new Timer();
    timer.connect(document);

    scene.add(light);
    scene.add(gridHelper);
    scene.add(axesHelper);

    const render = (timestamp?: number) => {
      timer.update(timestamp);
      // const delta = timer.getDelta();

      controls.update();
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

    resize();
    window.addEventListener('resize', resize);
    renderer.setAnimationLoop(render);

    return () => {
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);
      box.geometry.dispose();
      box.material.dispose();

      controls.dispose();
      gridHelper.dispose();
      axesHelper.dispose();
      timer.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="threeRoot"></canvas>;
};

export default Index;
