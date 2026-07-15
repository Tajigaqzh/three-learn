import type { RouteObject } from 'react-router-dom';
import { NotFoundPage } from '@/pages/notFound/NotFoundPage.tsx';
import { createElement, lazy } from 'react';

export const routes = [
  {
    path: '/',
    element: createElement(lazy(() => import('@/pages/basicCube/CubeScenePage'))),
  },
  {
    path: '/shadow-cube',
    element: createElement(lazy(() => import('@/pages/shadowCube/ShadowCubeScenePage'))),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
] satisfies RouteObject[];
