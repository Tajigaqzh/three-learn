import { useRef } from 'react';
import { useThreeCube } from './useThreeCube.ts';

const CubeScenePage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useThreeCube(canvasRef);

  return <canvas ref={canvasRef} id="threeRoot" />;
};

export default CubeScenePage;
