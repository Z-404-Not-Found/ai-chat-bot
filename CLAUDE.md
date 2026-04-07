# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

基于 Electron + Vue 3 + TypeScript 构建的 AI 聊天桌面应用。使用用户提供的 API 密钥调用 OpenAI SDK。本地聊天记录存储在 SQLite 中，支持 PostgreSQL 同步。

## 开发命令

```bash
pnpm install      # 安装依赖
pnpm dev         # 启动开发服务器（热模块替换）
pnpm build       # 完整构建（类型检查 + electron-vite 构建）
pnpm build:win   # Windows NSIS 安装包
pnpm build:mac   # macOS DMG
pnpm build:linux # Linux AppImage/deb
pnpm lint        # ESLint 检查（带缓存）
pnpm format      # Prettier 格式化
pnpm typecheck   # TypeScript 类型检查（node + web）
```

## 架构

### Electron 进程模型

- **主进程** (`src/main/`): 窗口创建、IPC 处理器、系统集成
- **预加载脚本** (`src/preload/index.ts`): 通过 `contextBridge` 暴露安全 API，IPC 通道通过类型守卫白名单验证
- **渲染进程** (`src/renderer/`): Vue 3 单页应用

### IPC 通信

使用 `@electron-toolkit/utils`：主进程向渲染进程发送用 `webContents.send`，接收用 `ipcMain.handle`。

- **通道命名**: `domain:resource:action` 模式（如 `ai:config:set`）
- **流式输出**: `ai:chat:stream-start` 发起 → `ai:stream:chunk` 推送（区分 `content`/`reasoning`）→ `ai:stream:end` 结束 → `ai:stream:cancel` 取消

### 构建工具

- **electron-vite**: 统一配置 main/preload/renderer 的 Vite 构建
- **electron-builder**: Windows/macOS/Linux 平台打包
- **electron-updater**: 通过 GitHub Releases 自动更新

## 前端技术栈

- **Vue 3.5** + Composition API + `<script setup>`
- **PrimeVue 4** + Aura 主题
- **Tailwind CSS v4**（`@tailwindcss/vite` 插件，非 v3 配置）
- **Vue Router** + Hash 模式

### Markdown 渲染

`src/renderer/src/components/MarkdownRenderer.vue` - marked + highlight.js + github-markdown-css + DOMPurify

## 数据库

**better-sqlite3**: `{userData}/user/chat.db`，软删除 + `sync_status` 追踪

| 表名            | 用途                           |
| --------------- | ------------------------------ |
| `characters`    | AI 角色定义（`system_prompt`） |
| `conversations` | 对话会话                       |
| `messages`      | 消息记录（`thinking` 字段）    |

**用户配置**: `{userData}/user/userData.json`，支持点号链式操作（如 `ai.model`）

## 关键文件

| 文件                          | 用途                    |
| ----------------------------- | ----------------------- |
| `src/main/index.ts`           | Electron 主进程入口     |
| `src/main/database/schema.ts` | 数据库表结构            |
| `src/main/ipc/chat.ts`        | 聊天功能（流式/非流式） |
| `src/preload/index.ts`        | 上下文桥接 API          |
| `src/shared/constants.ts`     | IPC 通道定义            |
| `src/shared/types.ts`         | TypeScript 类型         |

## 代码注释规范

项目所有代码注释均使用中文。

**保留英文的情况**: ESLint/TypeScript 编译指令、代码标识符、自动生成文件头部注释

## 测试

项目无测试框架，内联测试使用 `// TEST:` 和 `// END TEST` 包裹，验证后删除。
