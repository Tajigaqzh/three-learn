import type { ReactNode } from 'react';
import './IPhoneXSimulator.less';

type IPhoneXSimulatorProps = {
  children: ReactNode;
  zoom?: number;
};

const FRAME_WIDTH = 427;
const FRAME_HEIGHT = 864;

const IPhoneXSimulator = ({ children, zoom = 1 }: IPhoneXSimulatorProps) => (
  <div
    className="iphone-x-simulator-stage"
    style={{
      width: FRAME_WIDTH * zoom,
      height: FRAME_HEIGHT * zoom,
    }}
  >
    <div className="iphone-x-simulator" style={{ transform: `scale(${zoom})` }}>
      <div className="iphone-x-simulator-screen">{children}</div>
      <div className="iphone-x-simulator-notch" aria-hidden="true">
        <span className="iphone-x-simulator-camera" />
        <span className="iphone-x-simulator-speaker" />
      </div>
      <div className="iphone-x-simulator-volume" aria-hidden="true" />
      <div className="iphone-x-simulator-volume-button" aria-hidden="true" />
      <div className="iphone-x-simulator-power" aria-hidden="true" />
      <div className="iphone-x-simulator-glass" aria-hidden="true" />
      <div className="iphone-x-simulator-home-indicator" aria-hidden="true" />
    </div>
  </div>
);

export default IPhoneXSimulator;
