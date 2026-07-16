// 页面按钮和 Three.js 光源对象之间共用的光源类型。
export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';

// React 用这个对象保存每个光源是否开启。
export type LightState = Record<LightType, boolean>;
