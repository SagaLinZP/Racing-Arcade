# AGENTS.md — Racing Arcade 项目指南

## 项目概述

Racing Arcade 是 MOZA Racing 官方模拟赛车赛事发布与管理平台的前台交互原型。当前仅包含前台原型代码，后台管理功能未实现。

## 项目结构

```
Racing Arcade/
├── PRD.md                          # 产品需求文档（权威规格）
├── PROTOTYPE.md                    # 前台原型交互文档（权威规格）
├── ACC Dedicated Server Guide.md   # ACC 服务器配置参考
├── AGENTS.md                       # 本文件
├── ui-flow-map/index.html          # 页面流程图（独立 HTML）
├── .github/workflows/main.yml      # GitHub Pages 自动部署
└── prototype/                      # 前台原型代码
    ├── package.json
    ├── vite.config.ts              # base: '/Racing-Arcade/'
    ├── eslint.config.js            # ESLint flat config
    └── src/
        ├── main.tsx                # 入口（createRoot + StrictMode）
        ├── App.tsx                 # AppProvider + BrowserRouter + AppRouter
        ├── index.css               # Tailwind v4 @theme 暗色主题
        ├── app/                    # 应用组合根：路由、守卫、Shell
        │   ├── AppRouter.tsx       #   递归渲染路由表
        │   ├── AppProvider.tsx     #   AppContext Provider（全局状态）
        │   ├── AppShell.tsx        #   Navbar + BannedBanner + Outlet + Footer
        │   ├── routes.tsx          #   ★ 路由表（19 页 + 嵌套守卫）
        │   └── routeGuards.tsx     #   4 个路由守卫
        ├── domain/                 # 纯类型 + 无状态业务规则（无 React、无数据 import）
        │   ├── events.ts           #   ★ getEventStatus() + SimEvent 类型 + 筛选/排序函数
        │   ├── championships.ts    #   锦标赛赛程/积分/列表分区函数
        │   ├── common.ts           #   Region / CarClass / ScoringTableEntry
        │   ├── gamePlatforms.ts    #   GamePlatform（仅 AC / ACC）+ 颜色映射
        │   ├── drivers.ts          #   Driver 接口
        │   ├── teams.ts            #   Team / TeamMember 接口
        │   └── __tests__/          #   Vitest 领域测试
        ├── data/                   # Mock 静态数据 + 仓储适配器
        │   ├── events.ts           #   34 条赛事
        │   ├── championships.ts    #   5 条锦标赛
        │   ├── drivers.ts          #   25 条车手
        │   ├── teams.ts            #   6 条车队
        │   ├── notifications.ts    #   8 条通知（Notification 接口定义于此）
        │   ├── news.ts             #   5 条新闻（NewsArticle 接口定义于此）
        │   ├── protests.ts         #   4 条抗议（Protest 接口定义于此）
        │   ├── mozaDevices.ts      #   8 条设备（MozaDevice 接口定义于此）
        │   └── repositories/       #   ★ 仓储层：每个实体一个 list()/getById() 适配器
        ├── features/               # 功能级 hooks（调用 repositories + domain 选择器）
        │   ├── events/             #   hooks.ts + EventDetailView.tsx
        │   ├── championships/       #   hooks.ts + ChampionshipDetailView.tsx
        │   ├── registration/       #   hooks.ts（re-export useEventRegistration）
        │   ├── notifications/      #   hooks.ts
        │   ├── news/               #   hooks.ts
        │   ├── profile/            #   hooks.ts
        │   ├── teams/              #   hooks.ts
        │   └── calendar/           #   hooks.ts（re-export useEventList）
        ├── hooks/                  # 全局有状态 hooks
        │   ├── useAppStore.ts      #   ★ AppContext / useApp() / AppState / defaultState
        │   ├── useLocale.ts        #   ★ useLocale() → text()/field()/date() 双语辅助
        │   └── useEventRegistration.ts # ★ useEventRegistration() → register/unregister/getSnapshot
        ├── components/             # 共享展示组件
        │   ├── EventCard.tsx       #   EventCard + ChampionshipCard
        │   ├── StatusBadge.tsx
        │   ├── ScoringRulesCard.tsx
        │   ├── Dropdown.tsx        #   自定义下拉（替代原生 select）
        │   ├── ErrorBoundary.tsx   #   路由级错误边界（按 pathname 重置）
        │   ├── BannedUserBanner.tsx
        │   └── layout/             #   Navbar.tsx + Footer.tsx
        ├── pages/                  # 19 个路由页面（薄组件，委托给 features/）
        ├── shared/utils/           # 跨功能工具（eventVisuals.ts: getCoverGradient）
        ├── i18n/                   # index.ts + en.ts + zh.ts（21 个命名空间）
        ├── lib/utils.ts            # 兼容 shim：re-export cn() + domain 类型
        └── test/                   # setup.ts + appSmoke.test.tsx
```

## 分层架构

```
pages/        → 薄路由组件（取参数 → 调 hooks → 渲染 feature view）
    ↓
features/     → 功能级 hooks（调 repositories + domain 选择器，返回 view-model）
    ↓
data/repositories/  → 查询/筛选适配器（list/getById，委托 domain 函数）
    ↓
domain/       → 纯类型 + 无状态业务规则（状态机、筛选、排序、积分）

hooks/        → 全局有状态 context（useAppStore, useLocale, useEventRegistration）
app/          → 组合根（router, providers, guards, shell）
components/   → 共享展示组件
```

**数据流**：页面 → feature hooks → repositories → domain 函数 + static mock arrays。
**报名状态流**：`useEventRegistration` → `useApp().setState` 写入 `registrationOverrides[eventId]` → `getEventRegistrationSnapshot` 合并 override + 原始 event → 供 EventDetailView / ChampionshipDetailView 消费。

## 技术栈

- **React 19** + **TypeScript ~6.0** + **Vite 8**
- **Tailwind CSS v4**：`@import "tailwindcss"` + `@theme` 指令（非 v3 的 tailwind.config.js）
- **React Router v7**：`BrowserRouter` 需设置 `basename="/Racing-Arcade"` 匹配 GitHub Pages
- **react-i18next**：中英文双语，所有 UI 文案和 mock 数据内容字段均需双语
- **Lucide React**：唯一图标库
- **Vitest 4 + Testing Library**：单元测试 + 路由冒烟测试
- 无状态管理库，使用 React Context（`AppContext`）

## 环境与运行

- **Node.js**：通过 [fnm](https://github.com/Schniz/fnm) 管理（本地 v24，CI 用 Node 22）
- **包管理器**：`pnpm`（首选）或 `npm`（CI 使用 `npm ci`）
- 首次使用需确保 fnm 已激活：`eval "$(fnm env)"`（已写入 `~/.zshrc`）

## 构建命令

所有命令在 `prototype/` 目录下执行：

```bash
pnpm run dev          # 开发服务器 → http://localhost:5173/Racing-Arcade/
pnpm run lint         # ESLint
pnpm run typecheck    # tsc -b
pnpm run test         # vitest run
pnpm run build        # tsc -b && vite build
pnpm run check        # ★ 质量门：lint + typecheck + test + build
```

**提交前必须运行 `pnpm run check` 确保全部通过。**

## 权威文档

修改原型代码时，**必须**同步检查以下文档是否需要更新：

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
- **页面渲染**：使用 `useLocale()` hook 的 `text()` / `field()` 辅助函数选择字段（封装了 fallback 逻辑：主语言 → 英文 → 中文 → fallback）
- 新增 i18n key 时必须同时添加到 en.ts 和 zh.ts

### 代码规范

- TypeScript path alias：`@/` 映射 `./src/`，import 时使用 `@/domain/events` 而非相对路径
- `verbatimModuleSyntax: true`：type-only import 必须用 `import type { ... }`
- `tsconfig.app.json` 中 `ignoreDeprecations: "6.0"` 已配置，使用 `baseUrl`/`paths` 不报警告
- **不加注释**，除非用户明确要求
- 组件内 `useState` 必须放在所有条件返回语句之前

### 赛事状态

赛事状态由 `getEventStatus(event)` 动态计算（`src/domain/events.ts`），不依赖静态存储：

```
Cancelled / Draft / ResultsPublished → 存储值直接返回
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

- **当前代码中仅实现 AC / ACC**（`src/domain/gamePlatforms.ts` 定义 `GamePlatform = 'AC' | 'ACC'`）
- PRD 规划支持更多平台（AC Evo / iRacing / LMU / rF2 / ETS2），但尚未在代码中实现
- 游戏类型影响服务器信息展示：
  - **A 类（自建服务器）**：AC / ACC / AC Evo / LMU / rF2 / ETS2 — 显示"服务器名称+密码+直连链接"
  - **B 类（官方服务器）**：iRacing — 显示"Session 名称+密码+Hosted Session 链接"
- 判断方式：`game === 'iRacing'` 为 B 类，其余为 A 类
- MVP 阶段仅支持 AC / ACC 的自动开服配置（`EventServerProvisioning` 类型）

### 注册/报名交互

用户注册状态通过 `useEventRegistration` hook 集中管理（无后端）：

- mock 数据中 `registeredDriverIds` 为初始状态（不可变，不能直接修改）
- 运行时变更通过 `state.registrationOverrides[eventId]` 管理
- `getEventRegistrationSnapshot(event, userId, overrides)` 合并原始数据 + override，返回 `isRegistered` / `registrationCount` / `isFull` / `estimatedSplits` / `progressPercent`
- 报名成功后自动递增计数，取消报名后递减

### 路由与守卫

路由表定义在 `src/app/routes.tsx`，通过 4 个守卫嵌套（`src/app/routeGuards.tsx`）：

| 守卫 | 作用 |
|------|------|
| `GuestOnlyRoute` | 已登录用户重定向到首页（用于 `/login`） |
| `RequireAuth` | 未登录重定向到 `/login`（保留来源 location） |
| `RequireCompleteProfile` | 已登录但信息未补全 → 重定向到 `/register/complete`；匿名用户放行（公开页） |
| `RequireEventRegistrant` | 需登录 + 已报名该赛事（用于抗议提交页） |

- `vite.config.ts` 中 `base: '/Racing-Arcade/'` 匹配 GitHub Pages
- `App.tsx` 中 `BrowserRouter basename="/Racing-Arcade"` 匹配路由前缀
- GitHub Actions 部署（`.github/workflows/main.yml`），push 到 main 自动部署

### 仓储模式

页面**不直接 import mock 数据**，而是通过 `features/` hooks → `data/repositories/` 访问：

- 每个 repository 是一个纯对象，提供 `list(filters)` 和 `getById(id)` 方法
- 筛选/排序逻辑委托给 `domain/` 纯函数
- 新增数据查询需求时，优先在 domain 中添加纯函数，再在 repository 中调用

## 常见陷阱

1. **Tailwind v4** 不使用 `tailwind.config.js`，主题在 `index.css` 的 `@theme` 中定义
2. **原生 `<select>`** 在暗色主题下拉选项不可控，必须使用自定义 `Dropdown` 组件
3. **`space-y-*`** 会与子元素自身 padding 叠加导致间距翻倍
4. **`flex flex-col`** 子元素默认 stretch 撑满宽度，需要 `self-start` 或 `inline-block` 限制
5. **`RegistrationButton`** 是独立函数组件，无法访问父组件的 state/helper，需要通过 props 传入
6. **mock 数据不可变**：`events` 等是静态 import 的数组，不能直接 push/splice，所有运行时变更用 React state（`registrationOverrides`）管理
7. **锦标赛子赛事无独立页面**：所有跳转到子赛事的链接必须指向 `/championships/:championshipId`
8. **Upcoming 赛事**：`registeredDriverIds` 应为空（报名未开放不应有注册）
9. **`lib/utils.ts` 是兼容 shim**：现在只 re-export `cn()` 和 domain 类型，新代码应直接从 `@/domain/` 导入
10. **hooks 命名**：全局状态 hook 是 `useApp()`（不是 `useAppStore`），文件名为 `useAppStore.ts`
11. **页面是薄组件**：详情页委托给 `features/` 下的 View 组件（如 `EventDetailView.tsx`），不要在 pages/ 中写大量逻辑

## 修改流程清单

每次修改原型时，按以下顺序检查：

1. 修改原型代码（`prototype/src/`）
2. 检查 PRD.md 是否需要更新（数据模型、业务逻辑）
3. 检查 PROTOTYPE.md 是否需要更新（页面结构、交互、元素描述）
4. 在 PROTOTYPE.md 变更摘要追加记录
5. 运行 `pnpm run check`（workdir: `prototype/`）确保全部通过
6. 不要主动 commit，除非用户明确要求
