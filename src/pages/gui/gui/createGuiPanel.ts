import type { DirectionalLight } from 'three';
import { GUI } from 'dat.gui';
import type { GuiBox } from '../geometry/createBox';
import type { GuiSceneHelpers } from '../helper/createSceneHelpers';
import type { GuiState } from '../types';

export function createGuiPanel(
  guiState: GuiState,
  box: GuiBox,
  helpers: GuiSceneHelpers,
  light: DirectionalLight,
) {
  const gui = new GUI({ name: 'GUI Demo', width: 360 });

  gui
    .addColor(guiState, 'color')
    .name('Cube color')
    .onChange((color: string) => {
      box.material.color.set(color);
    });

  gui
    .add(guiState, 'width', 1, 20, 0.1)
    .name('Width')
    .onChange((width: number) => {
      box.updateSize(width, guiState.height, guiState.depth);
    });
  gui
    .add(guiState, 'height', 1, 20, 0.1)
    .name('Height')
    .onChange((height: number) => {
      box.updateSize(guiState.width, height, guiState.depth);
    });
  gui
    .add(guiState, 'depth', 1, 20, 0.1)
    .name('Depth')
    .onChange((depth: number) => {
      box.updateSize(guiState.width, guiState.height, depth);
    });

  gui
    .add(guiState, 'roughness', 0, 1, 0.01)
    .name('Roughness')
    .onChange((roughness: number) => {
      box.material.roughness = roughness;
    });
  gui
    .add(guiState, 'metalness', 0, 1, 0.01)
    .name('Metalness')
    .onChange((metalness: number) => {
      box.material.metalness = metalness;
    });
  gui.add(guiState, 'autoRotate').name('Auto rotate');
  gui
    .add(guiState, 'axes')
    .name('Axes')
    .onChange((visible: boolean) => {
      helpers.axesHelper.visible = visible;
    });
  gui
    .add(guiState, 'grid')
    .name('Grid')
    .onChange((visible: boolean) => {
      helpers.gridHelper.visible = visible;
    });
  gui
    .add(guiState, 'lightIntensity', 0, 3, 0.1)
    .name('Light')
    .onChange((intensity: number) => {
      light.intensity = intensity;
    });

  return gui;
}
