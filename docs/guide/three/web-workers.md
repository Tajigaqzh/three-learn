# Web Workers

`Web Worker` 是浏览器提供的后台线程能力。它的重点不是画 UI，而是把耗时任务从主线程挪出去，避免卡住页面。

在 Three.js 里，它最常见的用途是：

- 解析大模型
- 生成几何体数据
- 图片解码或压缩
- 数学计算
- `OffscreenCanvas` 离屏渲染

![Web Worker 三种类型](/images/js-worker-types.svg)

## 先分清三种 Worker

### Dedicated Worker

这是你最可能用到的一种。它只服务创建它的那个页面。

适合：

- `OffscreenCanvas` 渲染
- 复杂计算
- 数据解析
- 一次性的后台任务

```ts
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
});

worker.postMessage({ type: 'render' });
worker.onmessage = (event) => {
  console.log(event.data);
};
```

Worker 里接收消息：

```ts
self.onmessage = (event) => {
  const data = event.data;
  self.postMessage({ ok: true, data });
};
```

Three.js + `OffscreenCanvas` 的典型方式，就是把渲染循环和一些几何计算放进 Dedicated Worker。

### Shared Worker

`SharedWorker` 可以被多个同源页面、窗口或 iframe 共享。

适合：

- 多标签页共享状态
- 多页面共享一个长连接
- 统一做后台同步

```ts
const worker = new SharedWorker(new URL('./shared-worker.ts', import.meta.url), {
  type: 'module',
});

worker.port.postMessage({ type: 'hello' });
worker.port.start();
```

它更像“多个页面共用一个后台服务”。  
不适合拿来做页面主渲染，原因很简单：渲染职责通常还是一个页面各管各的。

### Service Worker

`ServiceWorker` 不负责你的业务渲染线程，它更像页面和网络之间的一层代理。

它最适合做：

- 资源缓存
- 离线访问
- 请求拦截
- 预加载
- 缓存版本管理

它和前两种最大的区别是：**它不是随页面生命周期一直跑的普通后台线程**，而是会经历注册、安装、激活、再拦截请求的流程。

![Service Worker 的注册和缓存流程](/images/js-service-worker-flow.svg)

## Service Worker 怎么用

### 1. 注册

在主线程里注册：

```ts
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  });
  console.log(registration);
}
```

这一步只是告诉浏览器：去加载 `sw.js`，让它管理这个作用域下的请求。

注意三件事：

- Service Worker 通常要求 HTTPS，开发时 `localhost` 可以用。
- `scope` 决定它能管理哪些 URL。
- `sw.js` 放得越靠近站点根目录，能管理的范围通常越大。

### 2. 安装时预缓存

`install` 事件通常用来缓存离线运行需要的静态资源：

```ts
const CACHE_NAME = 'app-v1';
const ASSETS = ['/', '/index.html', '/app.js', '/style.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});
```

这一步的意思是：先把关键资源放进缓存，后面即使网络差，也有机会直接打开。

### 3. 激活时清理旧缓存

版本更新后，旧缓存最好清掉：

```ts
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
});
```

这一步是避免旧版本资源和新版本资源混在一起。

### 4. 拦截请求

`fetch` 事件会拦截作用域内的请求：

```ts
self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirst(event.request));
});
```

一个常见策略是 `Cache First + Network Fallback`：

```ts
async function cacheFirst(request: Request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}
```

这表示：

- 先查缓存
- 命中就直接返回
- 没命中再请求网络
- 网络成功后把结果放进缓存

## Service Worker 适合什么

- PWA
- 离线资源包
- 大图、脚本、样式的静态缓存
- 需要控制请求策略的 Web App

## Service Worker 不适合什么

- DOM 操作
- 主渲染
- 实时 3D 计算循环
- 直接替代 Dedicated Worker 做离屏渲染

它的定位很明确：**管网络，不管画面。**

## 常见坑

- Service Worker 更新不是刷新页面就一定立刻生效，浏览器会走自己的安装和激活流程。
- 缓存策略要区分静态资源和接口数据，不要把所有请求都无脑缓存。
- 请求失败时要准备兜底响应，否则离线时仍然会白屏或报错。
- 开发阶段如果缓存太强，可能会以为代码没更新。

## 和 Three.js 的关系

如果你做 Three.js 项目，最常见的组合是：

- Dedicated Worker：解析模型、跑重计算、离屏渲染
- Service Worker：缓存模型、纹理、脚本、页面资源
- Shared Worker：只有在多页面共享状态时才考虑

## 一句话

Web Worker 不是只有“一个 worker”。

**Dedicated Worker 做计算，Shared Worker 做共享，Service Worker 做缓存和网络。**
