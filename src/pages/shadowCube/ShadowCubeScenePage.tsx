import { useRef } from 'react';
import { useShadowCube } from './useShadowCube.ts';

const ShadowCubeScenePage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useShadowCube(canvasRef);

  return <canvas ref={canvasRef} id="threeRoot" />;
};

export default ShadowCubeScenePage;
