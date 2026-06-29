---
description: 一键开发、部署、发布到云开发（CloudBase）的完整流程。涵盖云函数部署、前端构建、静态托管上传。依赖已连接的云开发账号。
alwaysApply: false
---

# 给阿嬤的情书 — 开发部署发布一条龙

## 前置条件

1. 已在 IDE 集成面板中登录 CloudBase 并选择环境
2. `.env` 文件已配置 `VITE_CLOUDBASE_ENV_ID`、`VITE_CLOUDBASE_REGION`、`VITE_CLOUDBASE_ACCESS_KEY`
3. 云函数环境变量 `CLOUDBASE_AI_API_KEY` 已设置

## 完整流程

### Phase 1: 环境检查

```
1. 调用 envQuery(action=info) 确认环境 ID 和状态
2. 确认环境状态为 NORMAL
3. 记录 envId、静态托管域名、区域
```

### Phase 2: 云函数部署

```
1. 读取 云函数/loveletter/index.js 确认代码无误
2. 调用 createFunction 部署云函数：
   - name: loveletter
   - runtime: Nodejs18.15
   - timeout: 60
   - handler: index.main
   - envVariables: { CLOUDBASE_AI_API_KEY: <从.env或控制台获取> }
   - force: true（覆盖已有）
3. 调用 writeSecurityRule 确保 loveletter 函数可公开调用：
   - resourceType: function
   - resourceId: loveletter
   - 在已有规则中追加 "loveletter": {"invoke": true}
4. 调用 invokeFunction 测试云函数：
   - name: loveletter
   - params: { to: "阿嬤", relation: "孙子/孙女", words: "测试", style: "warm" }
5. 确认返回 ok: true
```

### Phase 3: 前端构建

```
1. cd 静态托管/
2. npm install（如未安装依赖）
3. npm run build
4. 确认 dist/ 目录生成成功
```

### Phase 4: 静态托管部署

```
1. 调用 uploadFiles 将 dist/ 上传到静态托管根目录：
   - localPath: <绝对路径>/静态托管/dist
   - cloudPath: /
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
2. 输出完整的部署信息：
   - 前端地址
   - 云函数名称
   - 环境 ID
   - AI 模型
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
- 不要用 HTTP URL 直接调云函数，Event 函数不支持 HTTP 触发
- 前端的 `.env` 不要提交到 git（已在 .gitignore 中排除）
- 构建产物 `dist/` 不要提交到 git
- 每次部署前先 `npm run build`，确保是最新代码

## 回滚

如需回滚云函数：
```
1. 保留旧版 index.js 备份
2. 用 updateFunctionCode 重新上传旧版本
```

如需回滚前端：
```
1. 用旧的 dist/ 重新 uploadFiles
```
