---
name: deploy
description: 当用户提到"部署"、"deploy"、"发布"、"上线"、"一键部署"时使用此技能。帮助用户将「给阿嬷的情书」项目部署到腾讯云开发 CloudBase，包括云函数部署和静态托管上传。
---

# 给阿嬷的情书 — 一键部署

将项目部署到腾讯云开发 CloudBase，包括 5 个云函数和前端静态托管。

## 前置检查流程

在开始部署前，必须按顺序完成以下检查：

### Step 1: 检查 CloudBase 集成登录状态

调用 `envQuery(action=info)` 检查 CloudBase 是否已登录并连接环境。

- 如果未登录或未连接，提示用户：「请先在 CodeBuddy 左侧的集成面板中登录 CloudBase 并选择一个环境，然后再告诉我继续部署。」
- 如果已登录，记录 `envId` 和静态托管域名，继续下一步。

### Step 2: 确认环境信息

向用户展示当前连接的 CloudBase 环境信息，并请求确认：

```
检测到你已连接 CloudBase 环境：
- 环境 ID：{envId}
- 区域：{region}

请确认以上信息是否正确？
```

### Step 3: 检查 .env 文件

读取项目根目录的 `.env` 文件，检查以下配置是否存在：

| 变量名 | 用途 | 示例 |
|--------|------|------|
| `VITE_TCB_ENV_ID` | 前端 SDK 初始化（云函数 + 数据库环境） | `maralade-8gwkeq4g50e3afec` |
| `VITE_TCB_ACCESS_KEY` | 前端 Publishable Key | `your-publishable-key` |
| `AI_ENV_ID` | AI 大模型所在环境 ID（云函数服务端用） | `newenv-4gnsku1ra42bb737` |
| `AI_API_KEY` | AI 网关 API Key（云函数服务端用） | `your-ai-api-key` |

- 如果 `.env` 不存在，从 `.env.example` 复制并提示用户填写。
- 如果缺少必要配置，列出缺少的项目并询问用户提供。
- `AI_*` 变量不带 `VITE_` 前缀，仅在云函数服务端使用，不会暴露到前端。
- 前端和 AI 可能使用不同的云开发环境。

### Step 4: 确认部署范围

向用户确认要部署的内容：

```
即将部署以下内容：

☁️ 云函数（5 个）：
  - loveletter（AI 生成信件，JSON 结构化输出 + 收件人安全审核，超时 60s，需要 API Key）
  - getletter（读取信件，超时 10s）
  - listletters（信件列表，超时 10s）
  - countletters（信件计数，超时 10s）
  - publishletter（公开/撤回信件，超时 10s）

🌐 前端静态托管：
  - 构建 React 应用并上传到 CloudBase 静态托管

是否确认开始部署？
```

## 部署执行流程

用户确认后，按以下顺序执行：

### Phase 1: 部署云函数

逐个部署 5 个云函数，全部使用 `Nodejs18.15` 运行时，`handler: index.main`：

1. 调用 `createFunction` 部署每个函数（`force=true` 覆盖已有）
2. `loveletter` 函数需要设置环境变量 `AI_ENV_ID` 和 `AI_API_KEY`，值从 `.env` 读取
3. 部署完成后，调用 `writeSecurityRule` 设置所有函数可公开调用：
   - 每个函数设置 `{"invoke": true}`
4. 调用 `invokeFunction` 测试 `countletters` 确认函数可用

### Phase 1.5: 初始化数据库并询问是否导入预置数据

1. 检查 `letters` 集合是否存在（调用 `readNoSqlDatabaseStructure(action=listCollections)`）
   - 如果不存在，调用 `writeNoSqlDatabaseStructure(action=createCollection, collectionName=letters)` 创建集合
2. 检查集合中是否已有数据（调用 `invokeFunction(name=countletters)`）
3. 如果集合为空（count=0），询问用户：

```
📮 检测到数据库 letters 集合为空。

项目内置了电影《给阿嬷的情书》中木生与淑柔的 20 封往来书信作为公共树洞预置数据。
备份文件位于：docs/letters-backup.json

是否要导入这些预置书信数据？
  - 是：将 20 封信导入到 letters 集合（public=true，会显示在公共树洞页面）
  - 否：跳过，数据库保持为空
```

4. 如果用户选择导入：
   - 读取 `docs/letters-backup.json` 文件
   - 使用 `writeNoSqlDatabaseContent(action=insert, collectionName=letters, documents=[...])` 批量插入
   - 由于单次插入有数量限制，分两批（每批 10 条）插入
   - 插入后调用 `invokeFunction(name=countletters)` 验证数量
5. 如果集合已有数据（count>0），跳过此步骤，告知用户数据库已有 {count} 条数据

### Phase 2: 构建前端

```bash
cd 静态托管
npm install
npm run build
```

确认 `dist/` 目录生成成功。

### Phase 3: 上传静态托管

调用 `uploadFiles` 将 `静态托管/dist/` 上传到 CloudBase 静态托管根目录 `/`。

### Phase 4: 验证和输出

1. 拼接访问地址：`https://{静态托管域名}/`
2. 向用户展示部署结果：

```
🎉 部署完成！

☁️ 云函数：5/5 部署成功
🌐 前端地址：https://{域名}/

📋 CloudBase 控制台：
  - 云函数管理：https://tcb.cloud.tencent.com/dev?envId={envId}#/scf
  - 静态托管：https://tcb.cloud.tencent.com/dev?envId={envId}#/static-hosting
  - 数据库：https://tcb.cloud.tencent.com/dev?envId={envId}#/db/doc
```

## 数据库说明

项目使用 NoSQL 集合 `letters`，云函数首次写入时会自动创建。如需手动创建，可在 CloudBase 控制台数据库页面新建集合 `letters`，安全规则设为 `READONLY`。

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 文档 ID（自动生成） |
| `to` | string | 收信人称呼（AI 审核后的安全称呼） |
| `relation` | string | 与收信人的关系 |
| `style` | string | 信件风格：warm / fun / formal |
| `letter` | string | AI 生成的信件正文 |
| `musicMood` | string | 配乐情绪关键词 |
| `musicUrl` | string \| null | 背景音乐 URL（待接入） |
| `public` | boolean | 是否公开到树洞，默认 false |
| `createdAt` | Date | 创建时间 |

## 注意事项

- 云函数使用 Event 函数模式（`exports.main`），前端通过 `@cloudbase/js-sdk` 的 `callFunction` 调用
- 前端路由使用 `HashRouter`，分享链接格式：`https://域名/#/read/:id`
- `.env` 文件不会提交到 Git
- 云函数中不要硬编码环境 ID，通过 `process.env.TCB_ENV || process.env.SCF_NAMESPACE` 获取
