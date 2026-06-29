---
description: 一键开发、部署、发布到云开发（CloudBase）的完整流程。涵盖云函数部署、前端构建、静态托管上传。依赖已连接的云开发账号。
alwaysApply: false
---

# 给阿嬤的情书 — 开发部署发布一条龙

## 前置条件

1. 已在 IDE 集成面板中登录 CloudBase 并选择环境
2. 根目录 `.env` 已配置 `VITE_CLOUDBASE_ENV_ID`、`VITE_CLOUDBASE_REGION`、`VITE_CLOUDBASE_ACCESS_KEY`（同时作为 AI API Key）
3. 部署 `loveletter` 云函数时，需将 Access Key 设为环境变量 `CLOUDBASE_AI_API_KEY`

## 完整流程

### Phase 1: 环境检查

```
1. 调用 envQuery(action=info) 确认环境 ID 和状态
2. 确认环境状态为 NORMAL
3. 记录 envId、静态托管域名、区域
```

### Phase 2: 云函数部署

部署以下 5 个云函数（全部 Nodejs18.15, handler: index.main）：

| 函数名 | 超时 | 环境变量 | 说明 |
|--------|------|----------|------|
| loveletter | 60s | CLOUDBASE_AI_API_KEY | AI 生成信件 + 存数据库 |
| getletter | 10s | - | 按 ID 读取信件 |
| listletters | 10s | - | 分页获取公开信件列表 |
| countletters | 10s | - | 统计公开信件数量 |
| publishletter | 10s | - | 修改信件公开状态 |

```
1. 逐个调用 createFunction 部署（force=true 覆盖已有）
2. 调用 writeSecurityRule 确保所有函数可公开调用：
   - "loveletter": {"invoke": true}
   - "getletter": {"invoke": true}
   - "listletters": {"invoke": true}
   - "countletters": {"invoke": true}
   - "publishletter": {"invoke": true}
3. 调用 invokeFunction 测试 loveletter
```

### Phase 3: 前端构建

```
1. cd 静态托管/
2. npm install
3. npm run build
4. 确认 dist/ 目录生成成功
```

### Phase 4: 静态托管部署

```
1. 调用 uploadFiles 将 dist/ 上传到静态托管根目录
2. 等待上传完成
```

### Phase 5: 安全域名配置

```
1. 调用 envQuery(action=domains) 检查安全域名
2. 确认静态托管域名已在安全域名列表中
3. 如本地开发需要，添加 localhost:<port> 到安全域名
```

### Phase 6: 验证发布

```
1. 拼接访问地址：https://<静态托管域名>/
2. 输出完整的部署信息
3. 更新 README.md 中的部署信息
```

## 快速命令参考

| 操作 | 工具/命令 |
|------|-----------|
| 查环境 | `envQuery(action=info)` |
| 部署云函数 | `createFunction(func={...}, force=true)` |
| 更新云函数代码 | `updateFunctionCode(name, functionRootPath)` |
| 测试云函数 | `invokeFunction(name, params)` |
| 构建前端 | `cd 静态托管 && npm run build` |
| 上传静态托管 | `uploadFiles(localPath, cloudPath)` |
| 查安全域名 | `envQuery(action=domains)` |
| 设函数权限 | `writeSecurityRule(resourceType=function, ...)` |

## 注意事项

- 云函数用的是 **Event 函数**（exports.main），前端通过 `@cloudbase/js-sdk` 的 `callFunction` 调用
- 前端路由使用 `HashRouter`，分享链接格式：`https://域名/#/read/:id`
- `.env` 不要提交到 git（已在 .gitignore 中排除）
- `dist/` 不要提交到 git
- 云函数中不要硬编码环境 ID，通过 `process.env.TCB_ENV || process.env.SCF_NAMESPACE` 获取

## 数据库

集合 `letters`（安全规则：READONLY）

| 字段 | 说明 |
|------|------|
| to | 收信人称呼 |
| relation | 关系 |
| style | 风格 |
| letter | 信件正文 |
| musicMood | 配乐情绪 |
| public | 是否公开到树洞 |
| createdAt | 创建时间 |
