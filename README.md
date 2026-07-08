<div align="center">

# ITForge

### 淬码成钢 · 终成大器

纯前端锻造工业级开发利器：加密、转换、编解码，万般计算皆在浏览器熔炉中淬炼成型——数据主权，寸步不离本地。

[![License: MIT](https://img.shields.io/badge/License-MIT-ff4757.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-^18.3.1-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-^5.4.11-646cff.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-^3.4.15-38bdf8.svg)](https://tailwindcss.com)

</div>

---

## 项目简介

**ITForge** 是一款在线开发者工具箱，由陆壹锻造，专为开发者与 IT 从业者打造。采用工业拟物（Industrial Skeuomorphic）设计风格，所有计算在浏览器端完成，数据不离开本地。

本项目基于 MIT 协议永久免费开源。

## 功能特性

- **纯前端实现**：所有工具的计算逻辑均在浏览器端完成，无需后端服务，数据不出本地
- **工业拟物风格**：独特的工业设计语言，拟物阴影、冲压标签、LED 指示器
- **懒加载架构**：每个工具独立组件，按需加载，首屏极快
- **响应式布局**：适配桌面端与移动端
- **零数据上传**：敏感数据（密钥、Token、JSON）全程不出浏览器

## 工具一览

| 分类 | 工具 | 说明 |
|:-----|:-----|:-----|
| **加密 / 安全** | Token 生成器 | 生成随机安全令牌，支持自定义长度与字符集 |
| | Hash 文本 | MD5、SHA1/256/512、SHA3、RIPEMD160 多算法哈希 |
| **转换器** | Base64 编码/解码 | Base64 编码与解码，支持 UTF-8 安全转换 |
| | 日期时间转换器 | Unix 时间戳与 ISO 8601 互转，支持本地/UTC 时区 |
| | 大小写转换 | camelCase / snake_case / kebab-case 等命名风格互转 |
| **编解码 / 格式化** | CSV 到 JSON | CSV 数据解析为 JSON 数组，支持自定义分隔符 |
| | YAML 到 JSON | YAML 与 JSON 互转，适用于配置文件处理 |
| | XML 到 JSON | XML 文档转换为 JSON 结构，支持属性与命名空间 |
| | JSON 格式化 | JSON 美化、压缩、校验，支持 2/4 空格缩进 |
| | XML 格式化 | XML 美化、压缩、校验，支持 2/4 空格缩进 |
| | JWT 解析器 | 解码 JWT 的 Header 与 Payload，无需签名验证 |
| **Web** | HTTP 状态码 | 查询 HTTP / WebDav 状态码含义，支持模糊搜索 |
| | URL 编码/解码 | URL 字符串编码与解码，支持完整 URL 与组件级模式 |
| | JSON 差异比较 | 并排比对两个 JSON，高亮新增/删除/修改的字段 |
| **文本** | 文本对比 | 基于 Monaco DiffEditor 的逐行文本对比，支持多语言语法高亮 |

## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|:-----|:-----|:-----|:-----|
| 核心框架 | [React](https://react.dev) | ^18.3.1 | UI 视图层 |
| 构建工具 | [Vite](https://vitejs.dev) | ^5.4.11 | 开发服务器 + 打包 |
| 路由 | [react-router-dom](https://reactrouter.com) | ^6.28.0 | SPA 路由（v6 API） |
| 样式方案 | [Tailwind CSS](https://tailwindcss.com) | ^3.4.15 | 原子化 CSS |
| CSS 后处理 | PostCSS + Autoprefixer | ^8.4.49 / ^10.4.20 | 自动补全浏览器前缀 |
| 构建支持 | @vitejs/plugin-react | ^4.3.4 | Vite 的 React 插件 |
| 代码编辑器 | [monaco-editor](https://microsoft.github.io/monaco-editor/) | ^0.55.1 | 文本对比的 DiffEditor（VS Code 同款） |
| 图标库 | [lucide-react](https://lucide.dev) | ^0.460.0 | SVG 图标 |
| 加密 | [crypto-js](https://github.com/brix/crypto-js) | ^4.2.0 | Hash、JWT 等加密工具 |
| YAML 解析 | [js-yaml](https://github.com/nodeca/js-yaml) | ^4.1.0 | YAML ↔ JSON 转换 |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9（或 pnpm / yarn）

### 1. 安装依赖

```bash
npm install
```

### 2. 本地预览（默认 http://localhost:5173）

```bash
npm run dev
```

### 3. 生产打包验证（输出至 dist/）

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 项目结构

```
itforge/
├── src/
│   ├── components/          # 通用组件
│   │   ├── Sidebar.jsx      # 左侧可折叠导航栏
│   │   ├── Breadcrumb.jsx   # 面包屑导航
│   │   ├── TopBar.jsx       # 右上角工具栏（GitHub / 关于）
│   │   ├── AboutModal.jsx   # 关于弹窗
│   │   └── ToolLoader.jsx   # 工具懒加载器
│   ├── pages/
│   │   └── HomePage.jsx     # 首页
│   ├── tools/               # 各工具组件（按需懒加载）
│   │   ├── TokenGenerator.jsx
│   │   ├── HashText.jsx
│   │   ├── Base64Codec.jsx
│   │   ├── DateConverter.jsx
│   │   ├── CaseConverter.jsx
│   │   ├── CsvToJson.jsx
│   │   ├── YamlToJson.jsx
│   │   ├── XmlToJson.jsx
│   │   ├── JsonFormatter.jsx
│   │   ├── XmlFormatter.jsx
│   │   ├── JwtParser.jsx
│   │   ├── HttpStatusCodes.jsx
│   │   ├── UrlEncoder.jsx
│   │   ├── JsonDiff.jsx
│   │   └── TextDiff.jsx
│   ├── styles/
│   │   └── globals.css      # 全局样式 + Design Tokens
│   ├── tools.config.js      # 菜单配置（唯一数据源）
│   ├── App.jsx              # 应用布局框架
│   └── main.jsx             # 入口文件
├── tailwind.config.js        # Tailwind 配置
├── vite.config.js            # Vite 配置
├── package.json
└── LICENSE
```

## 扩展新工具

项目采用配置驱动的工具注册机制，扩展新工具只需三步：

1. 在 `src/tools/` 下创建 **PascalCase** 命名的组件文件（如 `NewTool.jsx`）
2. 在 [`src/tools.config.js`](./src/tools.config.js) 的 `TOOLS` 数组对应分组中添加一项：

   ```js
   {
     id: 'new-tool',           // kebab-case，需与文件名映射
     name: '新工具名称',
     desc: '工具描述',
     icon: '🔧'
   }
   ```

3. `ToolLoader` 会通过 `React.lazy(() => import('./tools/${PascalCase(id)}.jsx'))` 自动加载，**无需修改其他文件**

> 命名映射规则：`id="new-tool"` → 文件 `NewTool.jsx`

## 部署

本项目为纯静态前端应用，构建后可直接部署至任意静态托管服务：

- **Vercel** / **Netlify**：连接 GitHub 仓库，构建命令 `npm run build`，输出目录 `dist`
- **GitHub Pages**：执行 `npm run build` 后将 `dist/` 内容推送至 `gh-pages` 分支
- **Nginx**：将 `dist/` 内容复制至服务器静态资源目录

## 反馈与贡献

若现有工具无法满足需求，或您发现了功能异常，欢迎前往 [GitHub Issues](https://github.com/8135925/itforge/issues) 反馈。

无论是新功能提案还是 Bug 报告，每一条建议都是让这座工坊更完善的锤音。

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源，Copyright © 2026 LuYi。

若这座工坊为您提升了效率，欢迎加入书签并分享给同行——让更多工匠受益。

---

<div align="center">

**淬码成钢 · 终成大器**

Made with 🔨 by LuYi

</div>
