# 给阿嬤的情书

一个用 AI 替你给最亲的人写信的小应用。灵感来自电影《给阿嬷的情书》——
电影里谢南枝替人代笔写了一辈子，而这个应用，想做每个普通人的"谢南枝"。

> 本项目由 **CodeBuddy** 接入**云开发自定义大模型 `hy3-preview`** 开发。

## 功能

- 填写称呼、关系、想说的话，AI 生成一封有温度的家书
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
    ├── loveletter/               # AI 生成信件 + 存数据库
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
| `to` | string | 收信人称呼 |
| `relation` | string | 关系 |
| `style` | string | 风格（warm/fun/formal） |
| `letter` | string | 信件正文 |
| `musicMood` | string | 配乐情绪描述 |
| `musicUrl` | string | 音乐 URL（暂为 null） |
| `public` | boolean | 是否公开到树洞 |
| `createdAt` | date | 创建时间 |

## 配置说明

根目录 `.env` 文件（前端和云函数共用）：

```bash
VITE_CLOUDBASE_ENV_ID=你的云开发环境ID
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_ACCESS_KEY=你的Access Key（同时作为 AI API Key）
```

> `VITE_` 前缀让 Vite 前端能读取，云函数本地调试也从同一个文件读。云端部署时通过环境变量 `CLOUDBASE_AI_API_KEY` 设置。

## 本地开发

```bash
cd 静态托管
npm install
npm run dev
```

## 部署

1. 在 IDE 集成面板登录 CloudBase
2. 部署 5 个云函数（`loveletter` 需设 `CLOUDBASE_AI_API_KEY` 环境变量，超时 60s）
3. 构建前端 `npm run build`
4. 上传 `dist/` 到静态托管
