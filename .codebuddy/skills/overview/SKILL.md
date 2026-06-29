---
name: overview
description: 当用户首次打开项目、询问项目背景、了解项目结构、问"这个项目是做什么的"、"项目介绍"、"overview"、"概览"、"怎么开发"时自动加载此技能。提供项目的完整背景、技术栈、目录结构、核心组件说明和开发指南。
---

# 给阿嬷的情书 — 项目概览

## 项目背景

灵感来自电影《给阿嬷的情书》——电影里谢南枝替人代笔写了一辈子家书，而这个应用想做每个普通人的「谢南枝」。

用户只需填写收信人称呼、关系、想说的话，AI 就会生成一封有温度的家书。信件用毛笔楷书字体渲染，逐字打字机呈现，可以分享链接给收信人，也可以投递到「公共树洞」温暖更多人。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + Vite |
| 路由 | react-router-dom（HashRouter） |
| 云服务 | 腾讯云开发 CloudBase |
| 前端 SDK | @cloudbase/js-sdk |
| AI 大模型 | 云开发自定义模型 hy3-preview |
| 数据库 | CloudBase NoSQL（集合 `letters`） |
| 部署 | CloudBase 云函数 + 静态托管 |
| 字体 | 马善政毛笔楷书（MaShanZheng） |

## 目录结构

```
给阿嬷的情书/
├── .env.example                     # 环境变量模板
├── .env                             # 实际环境变量（不提交 Git）
├── README.md                        # 项目说明
├── LICENSE                          # 开源协议
│
├── .codebuddy/                      # CodeBuddy AI 辅助配置
│   ├── rules/tcb/                   # CloudBase 开发规则（模板自动生成）
│   └── skills/                      # 自定义 Skill
│       ├── overview/SKILL.md        # 📍 本文件：项目概览
│       └── deploy/SKILL.md          # 一键部署流程
│
├── 静态托管/                         # 前端应用
│   ├── public/assets/               # 设计素材（背景图、按钮图、字体）
│   ├── src/
│   │   ├── main.jsx                 # 应用入口
│   │   ├── App.jsx                  # 路由配置（HashRouter）
│   │   ├── cloudbase.js             # 云开发 SDK 初始化
│   │   ├── constants.js             # 关系选项、风格常量
│   │   ├── music.js                 # Web Audio 背景音乐引擎
│   │   │
│   │   ├── components/
│   │   │   ├── LetterView.jsx       # 信件展示（打字机逐字效果 + 落叶动画 + 署名）
│   │   │   ├── EnvelopeCard.jsx     # 信封卡片（三种随机样式，树洞列表用）
│   │   │   └── InkButton.jsx        # 墨水风格按钮
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # 首页：展示信件总数，入口按钮
│   │   │   ├── ComposePage.jsx      # 写信页：表单 + 调用 AI + 加载态管理
│   │   │   ├── LoadingOverlay.jsx   # 加载遮罩：书写背景图 + 失败弹窗 Modal
│   │   │   ├── ResultPage.jsx       # 结果展示：信件渲染 + 发送按钮
│   │   │   ├── SendPage.jsx         # 分享页：复制链接 + 投递树洞
│   │   │   ├── ReadPage.jsx         # 读信页：通过分享链接访问单封信
│   │   │   ├── TreeholePage.jsx     # 树洞广场：瀑布流浏览公开信件
│   │   │   └── AboutPage.jsx        # 关于页
│   │   │
│   │   └── styles/
│   │       ├── global.css           # 全局样式（字体、背景色）
│   │       ├── components.css       # 公共组件样式（按钮、加载、Modal、Toast、信封）
│   │       ├── home.css
│   │       ├── compose.css
│   │       ├── result.css
│   │       ├── send.css
│   │       ├── treehole.css
│   │       └── about.css
│   │
│   ├── vite.config.js               # Vite 配置（base='./', envDir='../'）
│   └── package.json
│
└── 云函数/                           # CloudBase 云函数（Event 函数模式）
    ├── README.md                    # 数据库结构和函数文档
    ├── loveletter/                  # 核心：AI 生成信件 + 写入 DB
    ├── getletter/                   # 按 ID 读取单封信件
    ├── listletters/                 # 分页获取公开信件列表
    ├── countletters/                # 统计公开信件总数
    └── publishletter/              # 修改信件公开/撤回状态
```

## 核心流程

```
用户填写表单 → ComposePage.handleSubmit()
      │
      ▼
  cloudbase.callFunction('loveletter', payload)
      │
      ▼
  云函数调用 hy3-preview 大模型生成信件
      │
      ▼
  写入 letters 集合，返回 { id, letter, musicMood }
      │
      ├── 成功 → ResultPage（打字机展示）→ SendPage（分享/投递树洞）
      └── 失败 → LoadingOverlay 弹出失败 Modal（支持重试或返回修改）
```

## 页面路由

| 路径 | 页面组件 | 功能 |
|------|----------|------|
| `#/` | HomePage | 首页，展示已有信件数，入口按钮 |
| `#/compose` | ComposePage | 写信：填写称呼/关系/想说的话/风格 |
| `#/result` | ResultPage | 信件结果：打字机逐字呈现 |
| `#/send` | SendPage | 分享链接 / 投递到树洞 |
| `#/read/:id` | ReadPage | 读信：收信人通过链接打开 |
| `#/treehole` | TreeholePage | 树洞广场：浏览公开信件 |
| `#/about` | AboutPage | 关于页 |

## 数据库

集合名：`letters`（NoSQL），首次写入时自动创建。

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 文档 ID（自动生成） |
| `to` | string | 收信人称呼，如"阿嬤"、"妈妈" |
| `relation` | string | 关系，如"孙女"、"女儿" |
| `style` | string | 信件风格：`warm` / `fun` / `formal` |
| `letter` | string | AI 生成的信件正文 |
| `musicMood` | string | 配乐情绪关键词（≤30 字） |
| `musicUrl` | string \| null | 背景音乐 URL（待接入，目前为 null） |
| `public` | boolean | 是否公开到树洞，默认 false |
| `createdAt` | Date | 创建时间 |

## 云函数说明

所有函数均为 Event 函数模式（`exports.main`），前端通过 `cloudbase.callFunction()` 调用。

| 函数名 | 超时 | 功能 | 特殊配置 |
|--------|------|------|----------|
| `loveletter` | 60s | AI 生成信件 + 写入 DB | 需要环境变量 `CLOUDBASE_AI_API_KEY` |
| `getletter` | 10s | 按 ID 读取信件 | — |
| `listletters` | 10s | 分页获取公开信件 | — |
| `countletters` | 10s | 统计公开信件数 | — |
| `publishletter` | 10s | 公开/撤回信件 | — |

## 环境变量

根目录 `.env`（前端和云函数共用）：

```
VITE_CLOUDBASE_ENV_ID=你的云开发环境ID
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_ACCESS_KEY=你的 Access Key（同时作为 AI API Key）
```

- `VITE_` 前缀让 Vite 前端能通过 `import.meta.env` 读取
- 云端部署时，`loveletter` 云函数通过环境变量 `CLOUDBASE_AI_API_KEY` 读取 API Key
- `VITE_CLOUDBASE_ACCESS_KEY` 和 `CLOUDBASE_AI_API_KEY` 的值相同

## 关键设计决策

1. **HashRouter**：使用 `#` 路由而非 History 路由，因为 CloudBase 静态托管不需要额外配置 SPA 回退规则
2. **envDir: '../'**：Vite 的 envDir 指向项目根目录，让前端和云函数共用同一个 `.env` 文件
3. **Event 函数模式**：所有云函数用 `exports.main` 而非 HTTP 触发，前端通过 SDK `callFunction` 调用，免去 CORS 配置
4. **字体预加载**：在 App.jsx 中使用 FontFace API 预加载毛笔楷书字体，避免信件展示时字体闪烁
5. **AI Prompt**：允许 AI 在用户原文基础上适当加工润色，但不编造用户没提到的事件

## 开发指南

### 本地运行

```bash
cd 静态托管
npm install
npm run dev    # 默认 http://localhost:4173
```

### 构建

```bash
cd 静态托管
npm run build  # 输出到 dist/
```

### 新增页面

1. 在 `src/pages/` 创建页面组件
2. 在 `App.jsx` 的 `<Routes>` 中添加路由
3. 在对应的 `src/styles/` 中添加样式文件，并在页面组件中 import

### 新增云函数

1. 在 `云函数/` 下创建新目录，包含 `index.js` 和 `package.json`
2. `index.js` 导出 `exports.main = async (event, context) => { ... }`
3. 通过 CloudBase 工具部署，并设置安全规则 `{"invoke": true}`
4. 前端通过 `cloudbase.callFunction({ name: '函数名', data: 参数 })` 调用
