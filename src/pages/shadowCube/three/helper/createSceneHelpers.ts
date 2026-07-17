import { AxesHelper, GridHelper } from 'three';

export function createAxesHelper() {
  return new AxesHelper(50);
}

export function createGridHelper() {
  return new GridHelper(100, 20);
}
