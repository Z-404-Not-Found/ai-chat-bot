# AI Chat Bot

一个面向桌面端的 AI 聊天应用，也是我的毕业设计项目。  
项目基于 Electron + Vue 3 + TypeScript，聚焦「角色化对话 + 本地持久化 + 流式体验 + 多端数据同步」的完整闭环。

## 项目亮点

- 角色驱动聊天：支持创建/编辑/删除角色，自定义系统提示词，形成不同人格与任务风格。
- 流式对话体验：支持实时流式输出、手动中断、推理内容展示（Thinking）与异常反馈。
- 智能上下文控制：可配置上下文条数（1~32），兼顾回答质量与 token 成本。
- 本地优先数据架构：基于 SQLite 持久化角色、会话、消息，支持软删除与同步状态追踪。
- Markdown 高质量渲染：支持代码高亮、暗色/亮色适配、内容净化、防注入处理、代码复制。
- 对话长图导出：可将完整聊天记录导出为 PNG，便于报告提交与成果展示。
- 云端同步能力：支持账号注册/登录、手动同步、增量拉取、冲突友好合并（基于 `updated_at`）。
- 桌面端原生体验：自定义窗口控制（最小化/最大化/关闭）、跨平台打包与自动更新支持。
- 安全 IPC 通信：通过 preload 暴露白名单 API，隔离渲染进程与主进程能力。

## 技术栈

- Desktop: Electron 39
- Frontend: Vue 3 + Vue Router + PrimeVue + Tailwind CSS 4
- Backend（本地）: Electron Main Process + better-sqlite3
- AI SDK: OpenAI Node SDK
- Build: electron-vite + electron-builder
- Language: TypeScript

## 功能概览

- 聊天模块
- 角色管理（Prompt 工程）
- 会话管理（自动命名、会话预览）
- 消息管理（用户/助手消息持久化）
- AI 参数配置（API Key、Base URL、Model、Thinking）
- 主题切换（多主题预设 + 明暗模式）
- 数据同步（登录、登出、同步状态、立即同步）
- 日志能力（主进程与渲染进程）

## 项目结构

```text
src/
├─ main/       # Electron 主进程：IPC、数据库、OpenAI 服务、同步服务
├─ preload/    # 安全桥接层：向渲染进程暴露受控 API
├─ renderer/   # Vue 3 前端页面与组件
└─ shared/     # 跨进程共享类型与常量
```

## 本地开发

```bash
pnpm install
pnpm dev
```

## 常用命令

```bash
pnpm lint           # 代码规范检查
pnpm typecheck      # TS 类型检查（node + web）
pnpm build          # 构建应用
pnpm build:win      # 构建 Windows 安装包
pnpm build:mac      # 构建 macOS 安装包
pnpm build:linux    # 构建 Linux 安装包
```

## 毕设价值

该项目不仅完成了 AI 聊天产品的基础能力，还实现了角色系统、流式交互、数据持久化、同步机制与工程化交付流程，具备从原型到可发布桌面应用的完整技术链路，可用于毕业答辩演示与后续迭代。
