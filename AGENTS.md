# AGENTS.md — Racing Arcade 项目指南

## 项目概述

Racing Arcade 是 MOZA Racing 官方模拟赛车赛事发布与管理平台的前台交互原型。当前仅包含前台原型代码，后台管理功能未实现。

## 项目结构

```
Racing Arcade/
├── PRD.md              # 产品需求文档（权威规格）
├── PROTOTYPE.md        # 前台原型交互文档（权威规格）
├── AGENTS.md           # 本文件
└── prototype/          # 前台原型代码
    ├── src/
    │   ├── App.tsx     # 路由定义（19个页面）
    │   ├── main.tsx    # 入口
    │   ├── index.css   # Tailwind v4 暗色主题
    │   ├── components/ # 共享组件
    │   │   ├── EventCard.tsx      # 赛事卡片 + 锦标赛卡片
    │   │   ├── StatusBadge.tsx
    │   │   ├── ScoringRulesCard.tsx
    │   │   ├── Dropdown.tsx       # 自定义下拉（替代原生select）
    │   │   └── layout/           # Navbar, Footer, Layout
    │   ├── data/        # Mock 数据（无真实后端）
    │   │   ├── events.ts         # 34条赛事
    │   │   ├── championships.ts  # 5条锦标赛
    │   │   ├── drivers.ts        # 25条车手
    │   │   ├── teams.ts          # 6条车队
    │   │   ├── notifications.ts  # 8条通知
    │   │   ├── news.ts           # 5条新闻
    │   │   ├── protests.ts       # 4条抗议
    │   │   └── mozaDevices.ts    # 设备目录
    │   ├── hooks/
    │   │   └── useAppStore.ts    # AppContext（全局状态）
    │   ├── i18n/
    │   │   ├── en.ts             # 英文翻译
    │   │   └── zh.ts             # 中文翻译
    │   ├── lib/
    │   │   └── utils.ts          # cn(), getEventStatus(), 类型定义
    │   └── pages/      # 19个页面
    │       ├── HomePage.tsx
    │       ├── EventsPage.tsx
    │       ├── EventDetailPage.tsx
    │       ├── ChampionshipDetailPage.tsx
    │       ├── CalendarPage.tsx
    │       ├── LeaderboardPage.tsx
    │       ├── MyEventsPage.tsx
    │       ├── NotificationsPage.tsx
    │       ├── SettingsPage.tsx
    │       ├── DriverPage.tsx
    │       ├── LoginPage.tsx
    │       ├── RegisterPage.tsx
    │       ├── NewsPage.tsx
    │       ├── NewsDetailPage.tsx
    │       ├── ProtestPage.tsx
    │       ├── MyProtestsPage.tsx
    │       ├── TeamManagePage.tsx
    │       └── TeamPublicPage.tsx
    └── dist/            # 构建输出（gitignored）
```

## 技术栈

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS v4**：使用 `@import "tailwindcss"` + `@theme` 指令（非 v3 的 tailwind.config.js）
- **React Router v6**：`BrowserRouter` 需设置 `basename="/Racing-Arcade"` 匹配 GitHub Pages
- **react-i18next**：中英文双语，所有 UI 文案和 mock 数据内容字段均需双语
- **Lucide React**：唯一图标库
- 无状态管理库，使用 React Context（`AppContext`）

## 权威文档

修改原型代码时，**必须**同步检查 PRD.md 和 PROTOTYPE.md 是否需要更新：

- **PRD.md**：产品需求规格。数据模型字段变更、业务逻辑变更、新增功能模块等需同步更新
- **PROTOTYPE.md**：前台交互规格。页面结构变更、新增/移除元素、交互逻辑变更等需同步更新

每次变更后，在 PROTOTYPE.md 末尾"变更摘要"追加记录，格式为 `> - vX.X — 变更描述`。

## 核心规则

### 设计规范

- **暗色主题**，背景 `#0a0a0a`，卡片 `#111111`，主色 `#e11d48`（MOZA 红）
- 所有颜色使用 Tailwind 语义 token（`text-primary`, `bg-card`, `text-muted-foreground` 等），不硬编码色值
- 圆角统一用 `rounded-xl` 或 `rounded-lg`，间距用 Tailwind 标准值

### 双语规范

所有用户可见内容必须有中英文：

- **UI 文案**：通过 i18n key 在 `src/i18n/en.ts` 和 `src/i18n/zh.ts` 中定义
- **Mock 数据内容**：使用 `_zh` / `_en` 后缀字段（如 `name_zh` / `name_en`）
- **页面渲染**：根据 `state.language` 选择对应字段（`const name = lang === 'zh' ? event.name_zh : event.name_en`）
- 新增 i18n key 时必须同时添加到 en.ts 和 zh.ts

### 代码规范

- TypeScript path alias：`@/` 映射 `./src/`，import 时使用 `@/data/events` 而非相对路径
- `verbatimModuleSyntax: true`：type-only import 必须用 `import type { ... }`
- `tsconfig.app.json` 中 `ignoreDeprecations: "6.0"` 已配置，使用 `baseUrl`/`paths` 不报警告
- **不加注释**，除非用户明确要求
- 组件内 `useState` 必须放在所有条件返回语句之前

### 赛事状态

赛事状态由 `getEventStatus(event)` 动态计算（`src/lib/utils.ts`），不依赖静态存储：

```
Cancelled / Draft → 管理员手动设置
results 非空 → Completed
时间区间计算 → Upcoming → RegistrationOpen → RegistrationClosed → InProgress
```

**不要**新增静态 status 判断逻辑，所有状态判断统一使用此函数。

### 赛事类型

两种赛事，路由不同：

- **独立赛事**：无 `championshipId`，路由 `/events/:id` → `EventDetailPage`
- **锦标赛子赛事**：有 `championshipId`，**没有独立详情页**，路由到 `/championships/:championshipId` → `ChampionshipDetailPage`
- `EventDetailPage` 中如果检测到 `event.championshipId`，自动 `<Navigate>` 到锦标赛页

### 游戏平台

支持的游戏：AC / ACC / AC Evo / iRacing / LMU / rF2 / ETS2（不含"PC"后缀）。

游戏类型影响服务器信息展示：

- **A 类（自建服务器）**：ACC / AC / AC Evo / LMU / rF2 / ETS2 — 显示"服务器名称+密码+直连链接"，加入指引"请在游戏内搜索服务器名称加入"
- **B 类（官方服务器）**：iRacing — 显示"Session 名称+密码+Hosted Session 链接"，加入指引"请在 iRacing 客户端中查找对应 Session"

判断方式：`game === 'iRacing'` 为 B 类，其余为 A 类。

### 注册/报名交互

用户注册状态通过页面内 `useState` 管理（无后端），mock 数据中 `registeredDriverIds` 为初始状态。报名成功后需同步更新本地报名人数计数（`regCount` / `regCountOverrides` state），取消报名时需递减。

### 路由与部署

- `vite.config.ts` 中 `base: '/Racing-Arcade/'` 匹配 GitHub Pages
- `App.tsx` 中 `BrowserRouter basename="/Racing-Arcade"` 匹配路由前缀
- GitHub Actions 部署（`.github/workflows/main.yml`），push 到 main 自动部署

## 构建命令

```powershell
# 在 prototype/ 目录下执行
npx vite build        # 生产构建
npx vite dev          # 开发服务器
```

**注意**：Windows PowerShell 中 `&&` 不可用，需要 `workdir` 参数或用 `; if ($?) { }` 链接命令。构建时请使用 `workdir` 参数指定 `prototype/` 目录。

## 常见陷阱

1. **Tailwind v4** 不使用 `tailwind.config.js`，主题在 `index.css` 的 `@theme` 中定义
2. **原生 `<select>`** 在暗色主题下拉选项不可控，必须使用自定义 `Dropdown` 组件
3. **`space-y-*`** 会与子元素自身 padding 叠加导致间距翻倍
4. **`flex flex-col`** 子元素默认 stretch 撑满宽度，需要 `self-start` 或 `inline-block` 限制
5. **`RegistrationButton`** 是独立函数组件，无法访问父组件的 state/helper，需要通过 props 传入
6. **mock 数据不可变**：`events` 等是静态 import 的数组，不能直接 push/splice，所有运行时变更用 React state 管理
7. **锦标赛子赛事无独立页面**：所有跳转到子赛事的链接必须指向 `/championships/:championshipId`
8. **Upcoming 赛事**：`registeredDriverIds` 应为空（报名未开放不应有注册）

## 修改流程清单

每次修改原型时，按以下顺序检查：

1. 修改原型代码（`prototype/src/`）
2. 检查 PRD.md 是否需要更新（数据模型、业务逻辑）
3. 检查 PROTOTYPE.md 是否需要更新（页面结构、交互、元素描述）
4. 在 PROTOTYPE.md 变更摘要追加记录
5. 运行 `npx vite build`（workdir: `prototype/`）验证构建通过
6. 不要主动 commit，除非用户明确要求
