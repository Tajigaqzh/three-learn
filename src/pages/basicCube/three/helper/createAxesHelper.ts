import * as THREE from 'three';

export const createAxesHelper = () => {
  return new THREE.AxesHelper(30);
};

export const createGridHelper = () => {
  return new THREE.GridHelper(10, 10);
};
