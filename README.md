# TimePulse - 现代化倒计时应用

致力于成为最漂亮的倒计时应用。

TimePulse 是一个具有现代化 UI 和交互的倒计时网页应用，支持多计时器管理、数据分享、全屏展示等功能。采用玻璃态设计和流畅动画效果，提供极佳的视觉体验。

预览: [TimePulse](https://timepulse.ravelloh.top/)

![image](https://raw.ravelloh.top/20250323/image.2obow0upmh.webp)
![image](https://raw.ravelloh.top/20250323/image.7zqlgqhqss.webp)
![image](https://raw.ravelloh.top/20250323/image.26ln7ftxqc.webp)
![image](https://raw.ravelloh.top/20250323/image.9nzydxa4pj.webp)
![image](https://raw.ravelloh.top/20250323/image.83a7egcmsx.webp)
![image](https://raw.ravelloh.top/20250323/image.9dd4kru4xb.webp)
![image](https://raw.ravelloh.top/20250323/image.51ebd8a4jh.webp)
![image](https://raw.ravelloh.top/20250323/image.6wqw5umcp8.webp)

## 特点

### 核心功能
- 支持多个计时器的创建和管理
- 数据本地存储与云端同步
- 支持生成分享链接和二维码
- 支持全屏展示模式
- 智能识别常用节假日
- 支持PWA，可安装到主屏幕并离线使用

### 视觉和交互
- 精美的玻璃态设计和流畅动效
- 自适应模糊渐变背景，随主题色变化
- 暗色/亮色主题自动切换
- 完全响应式设计，适配各种设备

### 新增特性
- 自定义滚动条与滚动进度指示器，与主题色联动
- PWA功能支持，可作为独立应用安装到设备
- 离线访问支持，无需网络也能使用核心功能
- 优化的渐变背景效果，解决色彩断层问题
- 自定义下拉菜单组件，完美适配明暗两种模式
- 支持键盘导航的无障碍交互体验
- 滚动触发区优化，改善移动设备触控体验

## 技术栈

- Next.js - React 框架
- Framer Motion - 高级动画库
- Tailwind CSS - 实用工具优先的 CSS 框架
- localStorage - 本地数据持久化
- [KV Cache](https://github.com/RavelloH/kv-cache) - 云端数据存储服务

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/RavelloH/TimePulse.git
cd TimePulse
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 使用说明

- 点击右下角"+"按钮创建新的倒计时
- 点击左下角分享按钮分享倒计时
- 点击右上角菜单切换主题或编辑计时器
- 点击右上角全屏按钮进入全屏模式
- 向下滚动可查看更多信息和运行日志
- 在设置中生成同步ID，用于在不同设备间同步数据

## 浏览器兼容性

- Chrome/Edge/Safari/Firefox 最新版本
- 支持大多数现代移动浏览器
- 不支持 IE11 及以下版本

## 贡献指南

欢迎提交 Pull Request 或 Issue 来帮助改进 TimePulse。

## 许可证

MIT License
