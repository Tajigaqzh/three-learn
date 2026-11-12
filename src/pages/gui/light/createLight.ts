import { DirectionalLight } from 'three';

export function createLight() {
  const light = new DirectionalLight(0xffffff, 1);

  light.position.set(5, 8, 10);

  return light;
}
