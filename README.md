# 给阿嬤的情书

一个用 AI 替你给最亲的人写信的小应用。灵感来自电影《给阿嬷的情书》——
电影里谢南枝替人代笔写了一辈子，而这个应用，想做每个普通人的"谢南枝"。

> 本项目由 **CodeBuddy** 接入**云开发自定义大模型 `hy3-preview`** 开发。
> 用到的是云开发 AI 的「文本生成 + 音乐生成」能力，用多少算多少。
> AI 开发工具文档：https://docs.cloudbase.net/ai/ai-tools/codebuddy

## 项目结构

```
给阿嬤的情书/
├── 静态托管/                     # 前端（React + Vite），部署到云开发静态托管
│   ├── public/
│   │   ├── assets/              # 设计素材（背景图、按钮、加载动画图等）
│   │   └── config.js            # ⭐ 后端 API 地址配置（唯一需要修改的配置文件）
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ComposePage.jsx  # 写信主页面
│   │   │   └── LoadingOverlay.jsx # 加载动画（研磨→执笔→书写）
│   │   ├── App.jsx
│   │   ├── data.js              # 常量、示例数据
│   │   ├── music.js             # 背景音乐合成引擎
│   │   └── styles.css           # 全局样式
│   ├── index.html               # 入口（引用 config.js）
│   ├── package.json
│   └── vite.config.js
└── 云函数/                       # 后端，部署到云开发云函数
    └── loveletter/
        ├── index.js             # 调用 hy3-preview 生成情书 + 配乐情绪
        └── package.json
```

## 配置说明

### 前端配置

唯一需要修改的文件：**`静态托管/public/config.js`**

```js
// 后端云函数地址（部署后修改此处即可）
window.LOVELETTER_API = 'https://<你的环境ID>.sh.run.tcloudbase.com/loveletter';
```

### 云函数环境变量

| 变量名 | 说明 |
|--------|------|
| `CLOUDBASE_AI_API_KEY` | CloudBase AI 的 API Key（在控制台 ApiKey 管理页创建） |
| `TCB_ENV` / `SCF_NAMESPACE` | 云开发环境 ID（云函数内自动注入，无需手动设置） |

## 工作流程

```
用户填写表单（称呼、关系、想说的话、风格）
   → 点击"替我写信"
   → 前端展示加载动画（研磨 → 执笔 → 书写）
   → 同时 POST 到云函数
       → 云函数调用 hy3-preview 生成情书正文
       → 再调一次模型，给出配乐情绪关键词
   → 动画播完 + 数据就绪后展示结果
   → 前端逐字呈现信件，并配上背景音乐
```

## 部署步骤

### 1. 开通能力

在 [云开发 AI 控制台](https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel) 开启 `hy3-preview` 模型。

### 2. 创建 API Key

在 [CloudBase 控制台 → ApiKey 管理](https://tcb.cloud.tencent.com/dev#/identity/token-management) 创建 API Key。

### 3. 部署云函数

```bash
# 通过 CloudBase CLI 或 CodeBuddy 集成部署
# 需要设置环境变量 CLOUDBASE_AI_API_KEY
# Runtime: Nodejs18.15, 超时: 60s
```

### 4. 部署前端

1. 修改 `静态托管/public/config.js` 中的 API 地址
2. 构建并部署到云开发静态托管：
```bash
cd 静态托管
npm install
npm run build
# 将 dist/ 目录上传到静态托管
```

## 当前部署信息

- **环境 ID**：`maralade-8gwkeq4g50e3afec`
- **云函数**：`loveletter`（Nodejs18.15，超时 60s）
- **云函数 HTTP 地址**：`https://maralade-8gwkeq4g50e3afec.sh.run.tcloudbase.com/loveletter`
- **静态托管域名**：`maralade-8gwkeq4g50e3afec-1301025099.tcloudbaseapp.com`
- **AI 模型**：`hy3-preview`

## 本地开发

```bash
cd 静态托管
npm install
npm run dev
# 访问 http://localhost:4173
```

## 为什么不花算力做配图？

那张泛黄信纸、竖排格线、印章，全用 CSS 实现，一行 token 不花。
**算力只留给真正需要"创作"的两件事：文字，和音乐。**
