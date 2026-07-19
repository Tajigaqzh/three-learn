import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Vite Project Docs',
  description: 'Project documentation',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Three.js', link: '/guide/three/' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [{ text: 'Getting Started', link: '/guide/' }],
      },
      {
        text: 'Three.js 入门',
        items: [
          { text: '总览', link: '/guide/three/' },
          { text: '入门', link: '/guide/three/getting-started' },
          { text: '场景 Scene', link: '/guide/three/scene' },
          { text: '相机 Camera', link: '/guide/three/camera' },
          { text: '渲染器 Renderer', link: '/guide/three/renderer' },
          { text: '渲染循环', link: '/guide/three/render-loop' },
          { text: '控制器 OrbitControls', link: '/guide/three/orbit-controls' },
          { text: '三维坐标轴与辅助线', link: '/guide/three/axes-grid' },
          { text: '变换 Transform', link: '/guide/three/transform' },
          { text: 'Object3D 与 Group', link: '/guide/three/object3d-group' },
          { text: '几何体 Geometry', link: '/guide/three/geometry' },
          { text: '物体 Mesh', link: '/guide/three/mesh' },
          { text: '材质 Material', link: '/guide/three/material' },
          { text: '纹理 Texture', link: '/guide/three/texture' },
          { text: '光照 Light', link: '/guide/three/light' },
          { text: '阴影 Shadow', link: '/guide/three/shadow' },
          { text: 'Raycaster 鼠标拾取', link: '/guide/three/raycaster' },
          { text: '前端二进制与类型化数组', link: '/guide/three/typed-arrays' },
          { text: '加载器 Loaders', link: '/guide/three/loaders' },
          { text: '外部 3D 模型', link: '/guide/three/gltf-models' },
          { text: '加载管理器 LoadingManager', link: '/guide/three/loading-manager' },
          { text: 'Web Workers', link: '/guide/three/web-workers' },
          { text: '资源释放', link: '/guide/three/dispose' },
        ],
      },
    ],
  },
});
