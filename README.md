# 🎵 WaveCraft Studio

> 网页端音乐可视化生成器 —— 在浏览器中完成从音频上传到高质量 MP4 视频导出的完整工作流。

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## 📖 项目简介

**WaveCraft Studio** 是一款纯前端运行的音乐可视化创作工具。用户上传音频文件后，可实时预览多种频谱动画效果，自定义配色、标题、封面与背景，最终通过浏览器原生能力离线渲染并导出为 **H.264 + AAC** 编码的 MP4 视频。

**所有处理均在本地完成，音频数据不会上传至任何服务器。**

### 核心特性

| 特性 | 说明 |
|------|------|
| 🎨 **5 种频谱预设** | 柱状频谱、径向频谱、波形、粒子频谱、演播室监听风格 |
| 📐 **4 种画面比例** | 16:9（横屏）、9:16（竖屏）、1:1（方形）、4:5（社交） |
| 🎬 **背景视频支持** | 可上传视频作为动态背景，与音频同步 |
| 📝 **动态标题卡片** | 支持淡入、打字机、滑入三种入场动画，可自定义字体与位置 |
| ✨ **粒子光晕特效层** | 独立粒子系统与光晕效果，叠加在频谱之上 |
| 🎛️ **精细参数调节** | 柱数、灵敏度、平滑度、颜色、镜像、圆角、缩放、偏移等 |
| 📤 **高质量视频导出** | 离线逐帧渲染，支持 720p/1080p、30fps/60fps、多码率 |
| 🔀 **多种导出模式** | 整曲导出、区间裁剪、8 秒无缝循环、媒体库拼接队列 |
| 💾 **本地媒体库** | 基于 IndexedDB 的音频/封面/视频资源管理，支持多曲连播 |
| 🥁 **智能节拍检测** | 实时/离线双路径分析，频谱动画与鼓点同步 |

---

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | React 19 + TypeScript 5.9 |
| **构建工具** | Vite 7.2 |
| **样式** | Tailwind CSS 3.4 + shadcn/ui (40+ 组件) |
| **状态管理** | Zustand 5 |
| **音频处理** | Web Audio API (AudioContext / AnalyserNode / OfflineAudioContext) |
| **视频编码** | WebCodecs API (VideoEncoder / AudioEncoder) |
| **视频封装** | mp4-muxer |
| **元数据读取** | music-metadata-browser |
| **本地存储** | IndexedDB (通过 idb-keyval) |
| **表单验证** | React Hook Form + Zod |
| **图表** | Recharts |

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10 或 **pnpm** ≥ 8
- **浏览器要求**：
  - 开发/预览：任意现代浏览器（Chrome / Edge / Firefox / Safari）
  - **视频导出**：必须使用 **Chrome 94+** 或 **Edge 94+**（需支持 WebCodecs API）

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/RaycornM/WaveCraftStudio.git
cd WaveCraftStudio

# 安装依赖（推荐使用 pnpm）
pnpm install

# 或使用 npm
npm install
```

### 开发模式

```bash
npm run dev
# 或
pnpm dev
```

服务默认启动在 `http://localhost:5173`，支持热更新（HMR）。

### 生产构建

```bash
npm run build
# 或
pnpm build
```

构建产物输出至 `dist/` 目录，可直接部署到任意静态托管服务（Vercel、Netlify、GitHub Pages、Cloudflare Pages 等）。

### 本地预览生产构建

```bash
npm run preview
# 或
pnpm preview
```

---

## 📖 使用指南

### 1. 上传音频

- 点击上传区域或拖拽音频文件（支持 MP3、WAV、FLAC、AAC、OGG 等格式）
- 系统自动提取内嵌封面与元数据（标题/艺术家/专辑）

### 2. 选择预设与布局

- **预设栏**：快速切换 5 种频谱风格
- **布局切换**：16:9（适合 B站/YouTube）、9:16（抖音/快手）、1:1（Instagram）、4:5（小红书）

### 3. 调节可视化参数

在右侧控制面板中可调整：

- **频谱**：柱数、灵敏度、平滑度、频率映射（线性/对数）、主色/辅色、光晕、镜像、圆角、缩放、偏移、峰值帽、倒影
- **特效**：粒子数量/颜色/强度、光晕强度/颜色
- **标题**：文字内容、位置、字号、颜色、字体、入场动画、显示时长
- **背景**：毛玻璃模糊、亮度、饱和度、暗角
- **进度条**：开关、时间文本
- **分析**：平滑系数、节拍检测阈值

### 4. 实时预览

- 点击播放按钮开始预览，频谱动画与音频实时同步
- 支持循环试听（可设定 8 秒区间反复播放，用于调试无缝循环效果）
- 支持 seek 跳转，画面随音频同步更新

### 5. 媒体库（可选）

- 将常用音频/封面/视频加入本地媒体库（IndexedDB 存储）
- 支持多曲队列连播预览
- 支持选择媒体库资源作为拼接导出的素材

### 6. 导出视频

点击「导出」按钮，配置以下参数：

| 参数 | 选项 |
|------|------|
| 分辨率 | 720p / 1080p |
| 帧率 | 30fps / 60fps |
| 码率 | 8Mbps / 12Mbps / 20Mbps |
| 导出模式 | 整曲 / 裁剪区间 / 8秒循环 / 队列拼接 |

导出流程：
1. **音频分析** — 离线逐帧提取频谱、频段能量、节拍数据
2. **音轨渲染** — OfflineAudioContext 渲染整段 PCM
3. **编码准备** — 初始化 H.264 视频编码器与 AAC 音频编码器
4. **逐帧渲染** — 固定帧步长驱动 Canvas 渲染，每帧编码为视频帧
5. **MP4 封装** — 视频流与音频流混合封装为 MP4 文件
6. **下载** — 自动触发浏览器下载

> ⚠️ **注意**：导出过程完全在浏览器本地进行，不依赖服务器。长音频导出可能消耗较多内存与 CPU，建议关闭其他标签页。

---

## 🧪 开发指南

### 代码规范

项目使用 ESLint 9 + typescript-eslint 进行代码检查：

```bash
npm run lint
```

### 添加新的频谱预设

1. 在 `src/render/presets/` 下新建预设文件（参考 `barSpectrum.ts`）
2. 实现 `drawXxxSpectrum(ctx, audioData, params, x, y, w, h, scale, loopPeriod?)` 函数
3. 在 `src/render/renderer.ts` 的 `switch` 语句中注册新预设
4. 在 `src/types/index.ts` 的 `PresetId` 联合类型中添加新标识
5. 在 `src/state/store.ts` 的 `DEFAULT_CONFIG` 中补充默认参数

### 添加新的画面布局

1. 在 `src/render/layouts.ts` 的 `LAYOUTS` 对象中添加新布局规格
2. 在 `src/types/index.ts` 的 `LayoutId` 中添加新标识

### 关键设计原则

- **预览与导出同构**：实时预览（AnalyserNode）与离线导出（离线分析数组）产出完全相同的 `AudioFrameData` 结构，喂给同一个 `renderFrame`，保证**所见即所得**
- **分辨率无关**：所有渲染参数以 1080p 短边为基准，通过 `scale = shortSide / 1080` 自动适配不同分辨率
- **状态隔离**：峰值帽等跨帧状态使用 `WeakMap<CanvasRenderingContext2D, State>` 隔离，预览与导出互不干扰

---

## 🖥️ 部署

### 静态托管

本项目为纯前端 SPA，构建后可直接部署：

```bash
# 构建
npm run build

# dist/ 目录即为部署产物
```

推荐平台：
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)
- [Cloudflare Pages](https://pages.cloudflare.com)

### Docker 部署（可选）

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 注意事项

- 由于使用 `type="module"` 和 ES Module 导入，部署时需确保服务器正确设置 MIME 类型
- 视频导出功能依赖 WebCodecs API，需通过 **HTTPS** 或 **localhost** 提供（浏览器安全策略要求）
- 大文件音频处理受浏览器内存限制，建议单次处理音频不超过 30 分钟

---

## 🛠️ 技术细节

### 音频分析架构

```
实时预览路径：
  File → ArrayBuffer → AudioContext.decodeAudioData → AudioBufferSourceNode → AnalyserNode → 实时频谱

离线导出路径：
  File → ArrayBuffer → AudioContext.decodeAudioData → OfflineAudioContext 渲染 PCM
                                      ↓
                              analyzeOffline() 逐帧分析 → AudioFrameData[]
                                      ↓
                              逐帧 renderFrame() → VideoEncoder
```

### 视频编码流程

```
Canvas 2D 逐帧渲染
    ↓
VideoFrame(canvas, {timestamp})
    ↓
VideoEncoder (H.264 High Profile)
    ↓
mp4-muxer (fastStart: in-memory)
    ↓
Blob (video/mp4) → 浏览器下载
```

### 节拍检测算法

- 对频谱能量做分频段加权（低频权重更高）
- 计算短期能量均值，当瞬时能量 > 均值 × `beatThreshold`（默认 1.4）时触发节拍
- 触发后指数衰减，避免连续误触发

---

## 📋 浏览器兼容性

| 功能 | Chrome | Edge | Firefox | Safari |
|------|--------|------|---------|--------|
| 音频播放/预览 | ✅ | ✅ | ✅ | ✅ |
| 实时频谱可视化 | ✅ | ✅ | ✅ | ✅ |
| 背景视频 | ✅ | ✅ | ✅ | ✅ |
| **视频导出** | **✅ 94+** | **✅ 94+** | ❌ | ❌ |
| IndexedDB 媒体库 | ✅ | ✅ | ✅ | ✅ |

---
