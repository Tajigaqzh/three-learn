import { AxesHelper, GridHelper } from 'three';

export function createSceneHelpers() {
  const gridHelper = new GridHelper(20, 20);
  const axesHelper = new AxesHelper(10);

  return {
    axesHelper,
    gridHelper,
    dispose: () => {
      axesHelper.dispose();
      gridHelper.dispose();
    },
  };
}

export type GuiSceneHelpers = ReturnType<typeof createSceneHelpers>;
