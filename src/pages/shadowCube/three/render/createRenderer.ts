import { PCFShadowMap, PerspectiveCamera, SRGBColorSpace, WebGLRenderer } from 'three';

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({
    antialias: true,
    canvas,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.setClearColor(0x262626);

  return renderer;
}

export function resizeRendererToCanvas(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
