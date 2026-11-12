import { Navigate, type RouteObject } from 'react-router-dom';
import { createElement, lazy } from 'react';

export const routes = [
  {
    path: '/',
    element: <Navigate to="/antd-mobile" replace />,
  },
  {
    path: '/antd-mobile',
    element: createElement(lazy(() => import('@/pages/antdMobile/index'))),
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
    path: '/gui',
    element: createElement(lazy(() => import('@/pages/gui/index'))),
  },

  {
    path: '/buffer',
    element: createElement(lazy(() => import('@/pages/bufferGeometry/index'))),
  },
  {
    path: '/mammoth',
    element: createElement(lazy(() => import('@/pages/mammoth/index'))),
  },
  {
    path: '/tour',
    element: createElement(lazy(() => import('@/pages/tour/index'))),
  },
  {
    path: '/tour-demo',
    element: createElement(lazy(() => import('@/pages/tourDemo/Layout'))),
    children: [
      {
        index: true,
        element: <Navigate to="/tour-demo/strategies" replace />,
      },
      {
        path: 'strategies',
        element: createElement(lazy(() => import('@/pages/tourDemo/StrategiesPage'))),
      },
      {
        path: 'account',
        element: createElement(lazy(() => import('@/pages/tourDemo/AccountPage'))),
      },
    ],
  },
  {
    path: '*',
    element: createElement(lazy(() => import('@/pages/notFound/NotFoundPage'))),
  },
] satisfies RouteObject[];
