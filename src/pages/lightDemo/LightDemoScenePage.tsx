import { useRef, useState } from 'react';
import { useLightDemo } from './useLightDemo';
import type { LightState, LightType } from './types';
import './LightDemoScenePage.css';

const LIGHT_OPTIONS: { type: LightType; label: string }[] = [
  { type: 'ambient', label: 'Ambient' },
  { type: 'directional', label: 'Directional' },
  { type: 'point', label: 'Point' },
  { type: 'spot', label: 'Spot' },
  { type: 'hemisphere', label: 'Hemisphere' },
];

const STRESS_BOX_STEP = 100;

const LightDemoScenePage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React 只保存“哪些灯开着”这个 UI 状态；真正的 Three.js Light 对象在 hook 内部同步。
  const [enabledLights, setEnabledLights] = useState<LightState>({
    ambient: true,
    directional: true,
    point: true,
    spot: true,
    hemisphere: false,
  });
  const [stressBoxCount, setStressBoxCount] = useState(0);

  useLightDemo(canvasRef, enabledLights, stressBoxCount);

  // 点击按钮时只翻转对应光源的开关状态，避免重建整个 Three.js 场景。
  const toggleLight = (type: LightType) => {
    setEnabledLights((currentEnabledLights) => ({
      ...currentEnabledLights,
      [type]: !currentEnabledLights[type],
    }));
  };

  // 控制压测用长方体数量，观察 Stats 面板里的 FPS/MS 变化。
  const changeStressBoxCount = (countOffset: number) => {
    setStressBoxCount((currentCount) => Math.max(0, currentCount + countOffset));
  };

  return (
    <main className="light-demo-page">
      <canvas ref={canvasRef} id="threeRoot" />
      <div className="light-demo-controls">
        <section className="light-demo-toolbar" aria-label="Light controls">
          {LIGHT_OPTIONS.map(({ type, label }) => (
            <button
              key={type}
              className="light-demo-button"
              data-active={enabledLights[type]}
              type="button"
              onClick={() => {
                toggleLight(type);
              }}
            >
              <span className="light-demo-button__indicator" />
              {label}
            </button>
          ))}
        </section>

        <section className="light-demo-toolbar" aria-label="Performance test controls">
          <button
            className="light-demo-button"
            type="button"
            onClick={() => {
              changeStressBoxCount(-STRESS_BOX_STEP);
            }}
          >
            -{STRESS_BOX_STEP}
          </button>
          <span className="light-demo-counter">Boxes: {stressBoxCount}</span>
          <button
            className="light-demo-button"
            type="button"
            onClick={() => {
              changeStressBoxCount(STRESS_BOX_STEP);
            }}
          >
            +{STRESS_BOX_STEP}
          </button>
          <button
            className="light-demo-button"
            type="button"
            onClick={() => {
              setStressBoxCount(0);
            }}
          >
            Clear
          </button>
        </section>
      </div>
    </main>
  );
};

export default LightDemoScenePage;
