import { AxesHelper, GridHelper } from 'three';

export const createAxesHelper = () => {
  return new AxesHelper(30);
};

export const createGridHelper = () => {
  return new GridHelper(10, 10);
};
