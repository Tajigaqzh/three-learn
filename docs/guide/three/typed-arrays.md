# 前端二进制与类型化数组

这一章专门讲前端里处理二进制数据的底层工具。它们和 Three.js 很相关，因为几何体、纹理、索引、模型文件、音视频数据，本质上都在和字节打交道。

先记住一件事：

- **`ArrayBuffer`** 只是一块原始内存。
- **TypedArray** 是“按某种类型看这块内存”的视图。
- **`DataView`** 是“按偏移灵活读写不同类型”的视图。

![前端二进制数据关系](/images/js-binary-overview.svg)

## 为什么需要它们

普通数组很灵活，但不适合高性能二进制场景：

```js
const arr = [1, 2, 3, 'x', {}];
```

而 3D、图片、文件、网络包更需要的是连续内存和明确的字节布局：

```js
const bytes = new Uint8Array([255, 0, 128]);
const floats = new Float32Array([1.5, 2.5, 3.5]);
```

这类结构能更高效地和 GPU、Canvas、WebAssembly、文件 API 配合。

## ArrayBuffer

`ArrayBuffer` 是最底层的容器，只负责存字节，不负责解释字节。

![ArrayBuffer：一整块原始内存](/images/js-arraybuffer-memory.svg)

```ts
const buffer = new ArrayBuffer(16);
```

它像一段连续内存，大小固定，创建后不能直接“按数字数组”去读。要读它，必须再套一层视图。

## TypedArray

TypedArray 是一组固定类型数组视图。常见的有：

| 类型                | 每项字节数 | 常见用途                   |
| ------------------- | ---------: | -------------------------- |
| `Int8Array`         |          1 | 带符号小整数               |
| `Uint8Array`        |          1 | 字节、图片、文件、网络数据 |
| `Uint8ClampedArray` |          1 | Canvas 像素                |
| `Int16Array`        |          2 | 16 位整数                  |
| `Uint16Array`       |          2 | 索引、16 位数据            |
| `Int32Array`        |          4 | 32 位整数                  |
| `Uint32Array`       |          4 | 更大的整数、索引           |
| `Float16Array`      |          2 | 半精度浮点                 |
| `Float32Array`      |          4 | 顶点、矩阵、坐标           |
| `Float64Array`      |          8 | 高精度浮点                 |
| `BigInt64Array`     |          8 | 64 位大整数                |
| `BigUint64Array`    |          8 | 64 位无符号大整数          |

### 视图是什么意思

同一块 `ArrayBuffer`，可以用不同类型去看：

![TypedArray：用固定类型解释同一块内存](/images/js-typedarray-views.svg)

```ts
const buffer = new ArrayBuffer(16);
const u8 = new Uint8Array(buffer);
const f32 = new Float32Array(buffer);
```

这三者不是三块内存，而是 **同一块内存的不同读法**。

### Uint8Array

`Uint8Array` 最像“原始字节数组”。

```ts
const bytes = new Uint8Array([0, 255, 128]);
```

适合：

- 文件内容
- 图片数据
- 网络响应
- glTF、GLB 等二进制资源

在 Three.js 里，它经常出现在纹理、模型加载和解析逻辑里。

### Uint8ClampedArray

`Uint8ClampedArray` 是“会自动夹住范围”的 8 位数组。

```ts
const data = new Uint8ClampedArray([0, 255, 300, -10]);
// 300 会变成 255，-10 会变成 0
```

它最常见的场景是 Canvas 像素：

![Uint8ClampedArray：Canvas 像素数据](/images/js-pixel-buffer.svg)

Canvas 的 `ImageData.data` 就是它。像素通道必须落在 `0-255`，所以这个类型很合适。

### Float32Array

`Float32Array` 是 Three.js 里最常见的数组类型之一。

```ts
const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
```

它常用于：

- 顶点坐标
- 法线
- UV
- 矩阵
- 粒子坐标

原因很简单：GPU 和 WebGL 更喜欢连续的 32 位浮点数据。

![Float32Array / Uint16Array：3D 顶点和索引](/images/js-vertex-buffer.svg)

### Uint16Array / Uint32Array

这两个最常见的场景是“索引”。

```ts
const indices = new Uint16Array([0, 1, 2]);
```

当你需要让多个三角形复用顶点时，就会用它们。顶点数量不大时用 `Uint16Array`，超过范围时换 `Uint32Array`。

### 其他整数和浮点数组

这些类型主要是按精度和范围区分：

- `Int8Array`：需要负数的小整数。
- `Int16Array`：更大的整数范围。
- `Int32Array`：更大的整数范围，常见于算法数据。
- `Float64Array`：对精度要求更高时用。
- `Float16Array`：更省内存，但精度更低。
- `BigInt64Array` / `BigUint64Array`：处理超大整数。

它们在 Three.js 里不如 `Float32Array`、`Uint8Array` 常见，但在二进制协议、科学计算、编码器里很常见。

## DataView

`DataView` 适合解析结构不统一的二进制数据。

![DataView：按字节偏移解析混合结构](/images/js-dataview-protocol.svg)

```ts
const buffer = new ArrayBuffer(20);
const view = new DataView(buffer);

view.setUint32(0, 0x12345678, true);
view.setUint16(4, 1, true);
view.setFloat32(6, 1.5, true);
```

它和 TypedArray 的区别是：

- TypedArray 更像“整齐的一列同类型数据”
- DataView 更像“二进制结构体解析器”

如果你要读文件头、协议包、模型格式头部字段，DataView 更顺手。

## Blob / File / Stream

前端里的二进制数据往往不是凭空来的，而是从文件、接口或流式数据进来的。

![Blob / File / Stream：二进制数据从哪里来](/images/js-file-stream.svg)

- `File`：用户从输入框或拖拽拿到的文件。
- `Blob`：一段二进制大对象。
- `ReadableStream`：按块读取的数据流。

常见链路是：

```ts
const res = await fetch('/model.glb');
const buffer = await res.arrayBuffer();
const bytes = new Uint8Array(buffer);
```

或者：

```ts
const file = input.files?.[0];
const buffer = await file.arrayBuffer();
```

## SharedArrayBuffer / WebAssembly.Memory

这部分更偏高级。

![SharedArrayBuffer / WebAssembly.Memory：高级共享内存](/images/js-shared-wasm-memory.svg)

`SharedArrayBuffer` 允许主线程和 Worker 共享同一块内存，常配合 `Atomics` 做并发同步。

`WebAssembly.Memory` 是 WebAssembly 的线性内存，JavaScript 通常用 TypedArray 去读写它。

它们适合：

- 多线程处理
- 编解码
- 重计算
- WebAssembly 集成

## 在 Three.js 里怎么理解

可以直接这么记：

- 几何体顶点数据：`Float32Array`
- 索引：`Uint16Array` / `Uint32Array`
- 纹理字节：`Uint8Array`
- Canvas 像素：`Uint8ClampedArray`
- 二进制文件解析：`DataView`

这就是为什么 Three.js 底层很多 API 都围绕 `BufferGeometry`、`ArrayBuffer`、`TypedArray` 在工作。

## 最后一句

如果你只记住一条线索，那就是：

**`ArrayBuffer` 存数据，TypedArray / DataView 解释数据。**
