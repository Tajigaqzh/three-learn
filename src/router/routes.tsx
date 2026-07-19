import { Navigate, type RouteObject } from 'react-router-dom';
import { NotFoundPage } from '@/pages/notFound/NotFoundPage.tsx';
import { createElement, lazy } from 'react';

export const routes = [
  {
    path: '/',
    element: <Navigate to="/material" replace />,
  },
  {
    path: '/basic',
    element: createElement(lazy(() => import('@/pages/basicCube/CubeScenePage'))),
  },
  {
    path: '/shadow-cube',
    element: createElement(lazy(() => import('@/pages/shadowCube/ShadowCubeScenePage'))),
  },
  {
    path: '/light-demo',
    element: createElement(lazy(() => import('@/pages/lightDemo/LightDemoScenePage'))),
  },
  {
    path: '/solar-system',
    element: createElement(lazy(() => import('@/pages/solarSystem/SolarSystemScenePage'))),
  },
  {
    path: '/solar',
    element: createElement(lazy(() => import('@/pages/solarSelf/index.tsx'))),
  },
  {
    path: '/material',
    element: createElement(lazy(() => import('@/pages/material/index'))),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
] satisfies RouteObject[];
