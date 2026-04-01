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

- **主进程** (`src/main/index.ts`): Electron 窗口创建、IPC 处理器注册、系统集成
- **预加载脚本** (`src/preload/index.ts`): 通过 `contextBridge` 向渲染进程暴露安全 API。所有 IPC 通道通过 `AllowedInvokeChannels` 和 `AllowedReceiveChannels` 类型守卫进行白名单验证
- **渲染进程** (`src/renderer/`): Vue 3 单页应用前端

### IPC 通信模式

主进程使用 `@electron-toolkit/utils` 进行窗口管理和 IPC：

```typescript
// 主进程向渲染进程发送
mainWindow.webContents.send('channel', data)
// 主进程通过 ipcMain.handle 接收渲染进程消息
```

**通道命名规范**: 使用 `domain:resource:action` 模式（如 `ai:config:set`、`ai:chat:stream-start`）。调用通道（`ipcMain.handle`）放在 `IPC_CHANNELS`，发送通道（`webContents.send`）放在 `IPC_SEND`。

### 构建工具

- **electron-vite** (`electron.vite.config.ts`): 统一配置 main/preload/renderer 的 Vite 构建
- **electron-builder** (`electron-builder.yml`): Windows/macOS/Linux 平台打包
- **electron-updater**: 通过 GitHub Releases 自动更新（配置于 `dev-app-update.yml`）

## 前端技术栈

- **Vue 3.5** + Composition API + `<script setup>`
- **PrimeVue 4** + Aura 主题（配置于 `main.ts`）
- **Tailwind CSS v4**（通过 `@tailwindcss/vite` 插件，非 Tailwind v3 配置）
- **Vue Router** + Hash 模式

## 数据库

- **better-sqlite3**: 本地 SQLite 存储聊天历史
- **pg**: PostgreSQL 客户端用于远程同步

**表结构设计**: 使用软删除（`deleted` 整数标志）和 `sync_status` 追踪变更，级联删除外键。表: `characters`（角色）、`conversations`（对话）、`messages`（消息）。

## 关键文件

| 文件                                | 用途                           |
| ----------------------------------- | ------------------------------ |
| `src/main/index.ts`                 | Electron 主进程入口            |
| `src/preload/index.ts`              | 上下文桥接 API 暴露            |
| `src/renderer/src/main.ts`          | Vue 应用初始化 + PrimeVue 配置 |
| `src/renderer/src/routers/index.ts` | Vue Router 配置                |
| `electron.vite.config.ts`           | Vite 构建配置                  |
| `electron-builder.yml`              | 应用打包配置                   |
| `package.json`                      | 依赖和脚本                     |

## TypeScript 配置

使用复合 TypeScript 项目：

- `tsconfig.json`: 基础配置，引用 node 和 web
- `tsconfig.node.json`: Main/preload/配置文件
- `tsconfig.web.json`: 渲染进程（Vue）文件

## 编辑器配置

- ESLint（扁平配置于 `eslint.config.mjs`）
- Prettier（`.prettierrc.yaml`）
- 推荐 VS Code: ESLint 扩展

## Git Hooks

Husky 预提交钩子对暂存文件运行 `lint-staged` 和 `typecheck`。

## 代码注释规范

项目所有代码注释均使用中文，遵循以下规范：

### 主进程 (`src/main/`)

| 文件                        | 注释内容                                                  |
| --------------------------- | --------------------------------------------------------- |
| `index.ts`                  | Electron 主进程入口，包含窗口创建、系统集成、生命周期管理 |
| `database/index.ts`         | 数据库初始化（设备 ID、打开数据库、启用外键、创建表）     |
| `database/characters.ts`    | 角色表的 CRUD 操作                                        |
| `database/conversations.ts` | 对话表的 CRUD 操作                                        |
| `database/messages.ts`      | 消息表的 CRUD 操作                                        |
| `ipc/index.ts`              | IPC 处理器注册                                            |
| `ipc/aiConfig.ts`           | AI 配置（API Key、Base URL、模型、思考模式、上下文数量）  |
| `ipc/chat.ts`               | 聊天功能（非流式/流式聊天、流式取消）                     |
| `ipc/character.ts`          | 角色管理 IPC                                              |
| `ipc/conversation.ts`       | 对话管理 IPC                                              |
| `ipc/message.ts`            | 消息管理 IPC                                              |
| `services/openai.ts`        | OpenAI 客户端初始化和重置                                 |
| `utils/userData.ts`         | 用户数据存储（嵌套对象点号链式操作）                      |
| `utils/logger.ts`           | 日志记录器初始化                                          |

### 预加载脚本 (`src/preload/`)

| 文件       | 注释内容                                                            |
| ---------- | ------------------------------------------------------------------- |
| `index.ts` | IPC 通道白名单验证、API 暴露（Character/Conversation/Message 管理） |

### 渲染进程 (`src/renderer/`)

| 文件                     | 注释内容                                                      |
| ------------------------ | ------------------------------------------------------------- |
| `main.ts`                | Vue 应用初始化、PrimeVue 主题配置、路由挂载                   |
| `routers/index.ts`       | Vue Router 配置（Hash 模式）                                  |
| `pages/Layout.vue`       | 布局组件                                                      |
| `pages/MarkdownDemo.vue` | Markdown 渲染示例（暗色模式检测、marked + highlight.js 配置） |

### 共享模块 (`src/shared/`)

| 文件           | 注释内容                                                                       |
| -------------- | ------------------------------------------------------------------------------ |
| `constants.ts` | IPC 通道定义（ai:config、ai:chat、character、conversation、message）           |
| `types.ts`     | TypeScript 类型定义（Character、Conversation、Message、AIConfig、ChatRequest） |

## 测试

项目**无测试框架**，测试代码以内联方式编写：

```typescript
// TEST: 验证 userData setItem/getItem 往返
const testKey = 'test_' + Date.now()
setItem(testKey, { foo: 'bar' })
const result = getItem(testKey)
console.assert(result.foo === 'bar', '往返测试失败')
removeItem(testKey)
// END TEST
```

生成测试代码时：

- 使用 `// TEST:` 和 `// END TEST` 包裹
- 包含清晰的测试描述
- 验证后删除测试代码

## 注释保留英文的情况

- ESLint 禁用指令（如 `// eslint-disable-next-line`）
- TypeScript 编译指令（如 `@ts-ignore`）
- 代码标识符（类型名、接口名、变量名）
- 自动生成的文件头部注释
