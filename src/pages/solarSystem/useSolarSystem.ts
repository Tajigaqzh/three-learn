import { type RefObject, useEffect } from 'react';
import { createSolarSystemScene } from './createSolarSystemScene';

/**
 * 连接 React 页面生命周期和 Three.js 太阳系示例。
 */
export function useSolarSystem(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const solarSystemScene = createSolarSystemScene(canvas);

    return () => {
      solarSystemScene.dispose();
    };
  }, [canvasRef]);
}
