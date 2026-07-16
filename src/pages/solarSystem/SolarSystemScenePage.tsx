import { useRef } from 'react';
import { useSolarSystem } from './useSolarSystem';
import './SolarSystemScenePage.css';

const SolarSystemScenePage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useSolarSystem(canvasRef);

  return (
    <main className="solar-system-page">
      <canvas ref={canvasRef} id="threeRoot" />
    </main>
  );
};

export default SolarSystemScenePage;
