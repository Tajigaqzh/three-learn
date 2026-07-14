import './App.css';
import { useRef } from 'react';
import { useThreeCube } from './hooks/useThreeCube';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useThreeCube(canvasRef);

  return <canvas ref={canvasRef} id="threeRoot" />;
}

export default App;
