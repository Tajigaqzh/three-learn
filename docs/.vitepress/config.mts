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
          { text: '物体 Mesh', link: '/guide/three/mesh' },
          { text: '材质 Material', link: '/guide/three/material' },
          { text: '光照 Light', link: '/guide/three/light' },
          { text: '阴影 Shadow', link: '/guide/three/shadow' },
          { text: '渲染循环', link: '/guide/three/render-loop' },
          { text: '资源释放', link: '/guide/three/dispose' },
        ],
      },
    ],
  },
});
