import { useRef } from 'react';
import { useSolarSystemSelf } from './useSolarSystemSelf';

const SolarSystemSelf = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useSolarSystemSelf(canvasRef);

  return (
    <main className="solar-system-page">
      <canvas ref={canvasRef} id="threeRoot" />
    </main>
  );
};

export default SolarSystemSelf;
