import { type RefObject, useEffect, useRef } from 'react';
import { createLightDemoScene } from './createLightDemoScene';
import type { LightState } from './types';

type LightDemoScene = ReturnType<typeof createLightDemoScene>;

/**
 * 连接 React 生命周期和 Three.js 场景。
 *
 * 第一个 effect 只负责初始化和销毁 Three.js 场景。
 * 第二个 effect 只负责把 React 里的灯光开关状态同步给已经存在的 Light 对象。
 */
export function useLightDemo(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  lightState: LightState,
  stressBoxCount: number,
) {
  const lightDemoSceneRef = useRef<LightDemoScene | null>(null);

  // 初始化场景只需要读取一次初始灯光状态；后续变化由下面的同步 effect 处理。
  const initialLightStateRef = useRef(lightState);
  const initialStressBoxCountRef = useRef(stressBoxCount);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const lightDemoScene = createLightDemoScene(
      canvas,
      initialLightStateRef.current,
      initialStressBoxCountRef.current,
    );
    lightDemoSceneRef.current = lightDemoScene;

    return () => {
      lightDemoScene.dispose();
      lightDemoSceneRef.current = null;
    };
  }, [canvasRef]);

  // React state 变化时，不重建 renderer/scene，只更新 Light.visible。
  useEffect(() => {
    lightDemoSceneRef.current?.setLightState(lightState);
  }, [lightState]);

  // 压测数量变化时，只增删测试 Mesh，不重建相机、渲染器和基础光源。
  useEffect(() => {
    lightDemoSceneRef.current?.setStressBoxCount(stressBoxCount);
  }, [stressBoxCount]);
}
