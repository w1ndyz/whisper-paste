# WhisperPaste

一个基于 AI 语音识别的桌面应用程序，可以将语音转换为文字并自动粘贴到剪切板。

![WhisperPaste](https://img.shields.io/badge/Electron-36.5.0-blue?logo=electron)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.11-blue?logo=tailwindcss)

## ✨ 功能特性

- 🎤 **AI 语音识别** - 使用 OpenAI Whisper API 进行高精度语音转文字
- 📋 **自动粘贴** - 识别结果自动复制到系统剪切板
- 🌍 **多语言支持** - 支持中文和英文界面切换
- 🎨 **现代化 UI** - 基于 Shadcn/ui 和 Tailwind CSS 的精美界面
- 🌙 **主题切换** - 支持明暗主题切换
- ⚙️ **灵活配置** - 可自定义 API 端点和密钥
- 🖥️ **跨平台** - 支持 Windows、macOS 和 Linux
- 📱 **系统托盘** - 最小化到系统托盘，随时可用
- 🔒 **隐私保护** - 本地处理，数据安全

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run start
```

### 构建应用

```bash
# 打包应用
npm run package

# 生成安装包
npm run make

# 发布应用
npm run publish
```

## 🛠️ 技术栈

### 核心框架 🏍️

- [Electron 36](https://www.electronjs.org) - 跨平台桌面应用框架
- [React 19](https://reactjs.org) - 用户界面库
- [TypeScript 5.8](https://www.typescriptlang.org) - 类型安全的 JavaScript
- [Vite 6](https://vitejs.dev) - 现代化构建工具

### UI 组件 🎨

- [Tailwind CSS 4](https://tailwindcss.com) - 实用优先的 CSS 框架
- [Shadcn/ui](https://ui.shadcn.com) - 高质量的 React 组件库
- [Radix UI](https://www.radix-ui.com) - 无样式的 UI 原语
- [Lucide React](https://lucide.dev) - 精美的图标库
- [Framer Motion](https://www.framer.com/motion) - 动画库

### 路由和状态管理 🔄

- [TanStack Router](https://tanstack.com/router) - 类型安全的路由
- [Zustand](https://zustand-demo.pmnd.rs) - 轻量级状态管理
- [TanStack Query](https://tanstack.com/query) - 数据获取和缓存

### 国际化 🌍

- [i18next](https://www.i18next.com) - 国际化框架
- [react-i18next](https://react.i18next.com) - React 国际化绑定

### 开发工具 🛠️

- [ESLint 9](https://eslint.org) - 代码检查
- [Prettier](https://prettier.io) - 代码格式化
- [Vitest](https://vitest.dev) - 单元测试
- [Playwright](https://playwright.dev) - 端到端测试

### 打包和分发 📦

- [Electron Forge](https://www.electronforge.io) - Electron 应用打包工具

## 📁 项目结构

```
src/
├── assets/                 # 静态资源
│   ├── fonts/             # 字体文件
│   └── icons/             # 图标文件
├── components/            # React 组件
│   ├── template/          # 模板组件
│   └── ui/               # UI 组件库
├── helpers/              # 工具函数
│   └── ipc/              # IPC 通信相关
├── layouts/              # 布局组件
├── localization/         # 国际化配置
├── pages/                # 页面组件
├── routes/               # 路由配置
├── services/             # API 服务
├── stores/               # 状态管理
├── styles/               # 全局样式
├── tests/                # 测试文件
├── types/                # TypeScript 类型定义
└── utils/                # 通用工具函数
```

## 🎯 使用说明

### 1. 配置 API

首次使用需要配置 OpenAI API：

1. 点击设置页面
2. 输入 Base URL（默认：`https://api.openai.com`）
3. 输入您的 API Key
4. 点击测试连接确保配置正确

### 2. 语音识别

1. 点击麦克风按钮开始录音
2. 说话完毕后点击停止
3. 等待 AI 处理语音
4. 识别结果自动复制到剪切板

### 3. 快捷操作

- 应用会自动隐藏到系统托盘
- 点击托盘图标可重新显示窗口
- 点击窗口外部区域自动隐藏窗口

## 🔧 配置选项

### API 设置
- **Base URL**: OpenAI API 端点地址
- **API Key**: 您的 OpenAI API 密钥

### 界面设置
- **语言切换**: 支持中文/英文
- **主题切换**: 明亮/暗黑主题

### 隐私设置
- **历史记录**: 可选择保存或清理历史
- **自动更新**: 控制应用自动更新行为

## 📝 可用脚本

```bash
# 开发
npm run start          # 启动开发服务器
npm run lint           # 代码检查
npm run format         # 检查代码格式
npm run format:write   # 格式化代码

# 测试
npm run test           # 运行单元测试
npm run test:watch     # 监听模式运行测试
npm run test:e2e       # 运行端到端测试
npm run test:all       # 运行所有测试

# 构建
npm run package        # 打包应用
npm run make           # 生成安装包
npm run publish        # 发布应用
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**w1ndyz** - [w1ndyz0618@gmail.com](mailto:w1ndyz0618@gmail.com)

## 🙏 致谢

- [OpenAI](https://openai.com) - 提供强大的 Whisper API
- [Electron](https://www.electronjs.org) - 跨平台桌面应用框架
- [Shadcn/ui](https://ui.shadcn.com) - 优秀的 React 组件库
- [Electron-Shadcn](https://github.com/LuanRoger/electron-shadcn) - Electron Forge with shadcn-ui 
- 所有开源贡献者

---

如果这个项目对您有帮助，请给个 ⭐️ 支持一下！