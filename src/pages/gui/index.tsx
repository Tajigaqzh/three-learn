import { useRef } from 'react';
import { useGuiScene } from './useGuiScene';

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useGuiScene(canvasRef);

  return <canvas ref={canvasRef} id="threeRoot"></canvas>;
};

export default Index;
