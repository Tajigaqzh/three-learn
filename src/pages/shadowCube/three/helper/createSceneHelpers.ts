import * as THREE from 'three';

export function createAxesHelper() {
  return new THREE.AxesHelper(50);
}

export function createGridHelper() {
  return new THREE.GridHelper(100, 20);
}
