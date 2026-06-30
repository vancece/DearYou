# 给阿嬤的情书

🔗 **在线预览**：[https://newenv-4gnsku1ra42bb737-1308771514.tcloudbaseapp.com/](https://newenv-4gnsku1ra42bb737-1308771514.tcloudbaseapp.com/)

一个用 AI 替你给最亲的人写信的小应用。灵感来自电影《给阿嬷的情书》——
电影里谢南枝替人代笔写了一辈子，而这个应用，想做每个普通人的"谢南枝"。

> 本项目由 **[CodeBuddy](https://www.codebuddy.cn/)** 接入 **[云开发自定义大模型](https://docs.cloudbase.net/ai/ai-tools/codebuddy) `hy3-preview`** 开发。

## 🚀 快速开始

只需三步，即可将项目部署到云端：

### 1. 用 CodeBuddy 打开本项目

```
用 CodeBuddy 打开项目文件夹「给阿嬷的情书」
```

### 2. 在集成面板登录 CloudBase

点击 CodeBuddy 左侧的 **集成** 面板，找到 **CloudBase（云开发）**，完成登录并选择一个云开发环境。

### 3. 对 AI 说一句话

在 CodeBuddy 对话框中输入：

> **请帮我部署这个项目**

AI 会自动：
- ✅ 检查 CloudBase 集成是否已登录
- ✅ 确认你的环境 ID 和 Access Key（API Key）
- ✅ 部署 5 个云函数到 CloudBase
- ✅ 构建前端并上传到静态托管
- ✅ 输出访问地址，打开即可使用

> 💡 **需要准备**：CloudBase 环境 ID 和 Access Key（Publishable Key），可在 [CloudBase 控制台](https://tcb.cloud.tencent.com/) 获取。Access Key 同时用作 AI 大模型的 API Key。

## 功能

- 填写称呼、关系、想说的话，AI 生成一封有温度的家书
- AI 自动审核收件人称呼，过滤不雅 / 违规内容，保障安全
- 三种风格可选：温情 / 幽默 / 正式
- 毛笔楷书字体（马善政毛笔楷书）渲染信件
- 打字机逐字呈现 + 背景音乐合成
- 分享链接给 Ta，对方打开即可阅读
- 投递到公共树洞，温暖更多人
- 树洞广场：浏览所有公开的家书

## 项目结构

```
给阿嬤的情书/
├── .env.example                  # 环境变量示例
├── 静态托管/                      # 前端（React + Vite）
│   ├── public/assets/            # 设计素材
│   ├── src/
│   │   ├── components/
│   │   │   ├── EnvelopeCard.jsx  # 信封卡片（三种随机样式）
│   │   │   ├── InkButton.jsx     # 墨水按钮
│   │   │   └── LetterView.jsx    # 信件展示（打字机 + 落叶 + 署名）
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # 首页
│   │   │   ├── ComposePage.jsx   # 写信页
│   │   │   ├── LoadingOverlay.jsx# 加载动画
│   │   │   ├── ResultPage.jsx    # 结果展示页
│   │   │   ├── SendPage.jsx      # 分享 / 投递树洞
│   │   │   ├── ReadPage.jsx      # 读信页（通过链接访问）
│   │   │   └── TreeholePage.jsx  # 公共树洞广场
│   │   ├── App.jsx               # 路由（react-router HashRouter）
│   │   ├── cloudbase.js          # 云开发 SDK 初始化
│   │   ├── data.js               # 关系选项、风格常量
│   │   ├── music.js              # Web Audio 背景音乐引擎
│   │   └── styles.css            # 全局样式
│   └── vite.config.js            # Vite 配置（envDir 指向根目录）
└── 云函数/
    ├── loveletter/               # AI 生成信件（JSON 结构化输出 + 收件人审核）+ 存数据库
    ├── getletter/                # 按 ID 读取信件
    ├── listletters/              # 分页获取公开信件列表
    ├── countletters/             # 统计公开信件数量
    └── publishletter/            # 修改信件公开状态
```

## 路由

| 路径 | 页面 |
|------|------|
| `#/` | 首页 |
| `#/compose` | 写信页 |
| `#/result` | 信件结果展示 |
| `#/send` | 分享 / 投递树洞 |
| `#/read/:id` | 读信页（分享链接入口） |
| `#/treehole` | 公共树洞广场 |

## 数据库

集合 `letters`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `to` | string | 收信人称呼（AI 审核后的安全称呼） |
| `relation` | string | 关系 |
| `style` | string | 风格（warm/fun/formal） |
| `letter` | string | 信件正文 |
| `musicMood` | string | 配乐情绪描述 |
| `musicUrl` | string | 音乐 URL（暂为 null） |
| `public` | boolean | 是否公开到树洞 |
| `createdAt` | date | 创建时间 |

## 配置说明

根目录 `.env` 文件：

```bash
# 前端 SDK（云函数 + 数据库，maralade 环境）
VITE_TCB_ENV_ID=你的云开发环境ID
VITE_TCB_ACCESS_KEY=你的 Publishable Key

# AI 大模型（newenv 环境，云函数部署时设为环境变量）
AI_ENV_ID=你的AI环境ID
AI_API_KEY=你的 AI API Key
```

> `VITE_TCB_*` 供前端 SDK 初始化（调云函数 / 数据库），`AI_*` 供云函数调用 AI 大模型（不带 `VITE_` 前缀，不会暴露到前端）。两组变量对应不同的云开发环境。

## 云开发模型 × CodeBuddy

本项目使用的 AI 大模型 `hy3-preview` 来自 [云开发 AI 控制台](https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel)。你也可以将云开发模型接入 CodeBuddy 作为自定义大模型来编码：

1. 在 [AI 控制台](https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel) 启用目标模型，获取 **Base URL** 和 **API Key**
2. 在 CodeBuddy 中点击「打开 Agents」→ 模型列表 →「配置自定义模型」
3. 填入 Base URL、API Key 和模型名称，保存后即可使用

> 📖 详细配置文档：[云开发模型接入 CodeBuddy](https://docs.cloudbase.net/ai/ai-tools/codebuddy)

## 本地开发

```bash
cd 静态托管
npm install
npm run dev
```

## 部署

1. 在 IDE 集成面板登录 CloudBase
2. 部署 5 个云函数（`loveletter` 需设 `AI_ENV_ID` 和 `AI_API_KEY` 环境变量，超时 60s）
3. 构建前端 `npm run build`
4. 上传 `dist/` 到静态托管

> 💡 或者直接用 CodeBuddy 对 AI 说「请帮我部署这个项目」，一键完成以上所有步骤。
