export type GuiState = {
  color: string;
  roughness: number;
  metalness: number;
  autoRotate: boolean;
  axes: boolean;
  grid: boolean;
  lightIntensity: number;
  width: number;
  height: number;
  depth: number;
};

export function createGuiState(): GuiState {
  return {
    color: '#0000ff',
    roughness: 0.78,
    metalness: 0,
    autoRotate: false,
    axes: true,
    grid: true,
    lightIntensity: 1,
    width: 2,
    height: 1,
    depth: 1,
  };
}
