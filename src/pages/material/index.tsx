import { useEffect, useRef } from 'react';
import {
  AmbientLight,
  AxesHelper,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  ShadowMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Timer,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type MaterialDemoItem = {
  name: string;
  material:
    | MeshBasicMaterial
    | MeshLambertMaterial
    | MeshPhongMaterial
    | MeshStandardMaterial
    | MeshPhysicalMaterial
    | MeshToonMaterial
    | MeshNormalMaterial
    | MeshDepthMaterial
    | MeshMatcapMaterial;
};

function createMatcapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const context = canvas.getContext('2d');

  if (!context) {
    return new CanvasTexture(canvas);
  }

  const gradient = context.createRadialGradient(42, 34, 8, 64, 64, 78);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.28, '#7dd3fc');
  gradient.addColorStop(0.62, '#2563eb');
  gradient.addColorStop(1, '#111827');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  return texture;
}

function createLabel(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;

  const context = canvas.getContext('2d');

  if (context) {
    context.fillStyle = 'rgba(15, 23, 42, 0.76)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(148, 163, 184, 0.7)';
    context.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
    context.fillStyle = '#f8fafc';
    context.font = '600 24px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new Sprite(material);
  sprite.scale.set(3.2, 0.8, 1);

  return { sprite, texture, material };
}

export default function Material() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x0f172a);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    const scene = new Scene();
    scene.background = new Color(0x0f172a);
    scene.add(new AxesHelper(4));

    const camera = new PerspectiveCamera(45, 1, 0.1, 300);
    camera.position.set(0, 7, 18);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(0, 1, 0);

    const ambientLight = new AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 2.2);
    directionalLight.position.set(-6, 9, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    scene.add(directionalLight);

    const pointLight = new PointLight(0xffb86c, 2.2, 26);
    pointLight.position.set(5, 4.5, 5);
    scene.add(pointLight);

    const lightMarker = new Mesh(
      new SphereGeometry(0.18, 16, 16),
      new MeshBasicMaterial({ color: 0xffb86c }),
    );
    lightMarker.position.copy(pointLight.position);
    scene.add(lightMarker);

    const ground = new Mesh(
      new PlaneGeometry(28, 14),
      new ShadowMaterial({
        color: 0x000000,
        opacity: 0.28,
        transparent: true,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.35;
    ground.receiveShadow = true;
    scene.add(ground);

    const matcapTexture = createMatcapTexture();
    const geometry = new TorusKnotGeometry(0.68, 0.23, 96, 16);
    const demoGroup = new Group();
    const labelResources: ReturnType<typeof createLabel>[] = [];

    const demoItems: MaterialDemoItem[] = [
      {
        name: 'Basic',
        material: new MeshBasicMaterial({ color: 0x38bdf8 }),
      },
      {
        name: 'Lambert',
        material: new MeshLambertMaterial({ color: 0x38bdf8 }),
      },
      {
        name: 'Phong',
        material: new MeshPhongMaterial({
          color: 0x38bdf8,
          shininess: 95,
          specular: 0xffffff,
        }),
      },
      {
        name: 'Standard',
        material: new MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.32,
          metalness: 0.25,
        }),
      },
      {
        name: 'Physical',
        material: new MeshPhysicalMaterial({
          color: 0x38bdf8,
          roughness: 0.18,
          metalness: 0.15,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
        }),
      },
      {
        name: 'Toon',
        material: new MeshToonMaterial({ color: 0x38bdf8 }),
      },
      {
        name: 'Normal',
        material: new MeshNormalMaterial(),
      },
      {
        name: 'Depth',
        material: new MeshDepthMaterial(),
      },
      {
        name: 'Matcap',
        material: new MeshMatcapMaterial({
          color: 0xffffff,
          matcap: matcapTexture,
        }),
      },
      {
        name: 'Wireframe',
        material: new MeshBasicMaterial({
          color: 0xf8fafc,
          wireframe: true,
        }),
      },
    ];

    demoItems.forEach((item, index) => {
      const column = index % 5;
      const row = Math.floor(index / 5);
      const x = (column - 2) * 3;
      const y = row === 0 ? 2.1 : -1.2;

      const mesh = new Mesh(geometry, item.material);
      mesh.position.set(x, y, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      demoGroup.add(mesh);

      const label = createLabel(item.name);
      label.sprite.position.set(x, y - 1.45, 0);
      demoGroup.add(label.sprite);
      labelResources.push(label);
    });

    scene.add(demoGroup);

    const timer = new Timer();
    timer.connect(document);

    const render = (timestamp?: number) => {
      timer.update(timestamp);

      const elapsed = timer.getElapsed();
      demoGroup.children.forEach((child) => {
        if (child instanceof Mesh && child.geometry === geometry) {
          child.rotation.x = elapsed * 0.35;
          child.rotation.y = elapsed * 0.5;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    requestAnimationFrame(resize);
    renderer.setAnimationLoop(render);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);
      controls.dispose();
      timer.dispose();

      geometry.dispose();
      ground.geometry.dispose();
      ground.material.dispose();
      lightMarker.geometry.dispose();
      lightMarker.material.dispose();
      matcapTexture.dispose();
      demoItems.forEach((item) => item.material.dispose());
      labelResources.forEach((label) => {
        label.texture.dispose();
        label.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="threeRoot"></canvas>;
}
