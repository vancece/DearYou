# 云函数：loveletter

「给阿嬤的情书」的后端云函数。负责调用**云开发接入的自定义大模型 `hy3-preview`**，把用户填写的几条小事，生成一封情书，并给出一段配乐情绪描述。

> 本项目由 **CodeBuddy** 接入云开发自定义大模型 **hy3-preview** 开发。
> AI 开发工具文档：https://docs.cloudbase.net/ai/ai-tools/codebuddy

## 目录

```
loveletter/
├── index.js        # 云函数入口，调用 hy3-preview
├── package.json
└── README.md
```

## 环境变量

在云开发控制台 → 云函数 → 环境变量中配置：

| 变量 | 说明 | 获取位置 |
|---|---|---|
| `TCB_ENV` | 云函数所在环境 ID | 云开发控制台（自动注入） |
| `AI_ENV_ID` | AI 大模型所在环境 ID | `.env` 文件 |
| `AI_API_KEY` | AI 网关 API Key | [AI 控制台](https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel) |

> Base URL 形如 `https://<ENV_ID>.api.tcloudbasegateway.com/v1/ai/cloudbase`，兼容 OpenAI 协议。
> 使用前需在 [AI 控制台](https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel) 中开启 `hy3-preview` 模型。

## 入参

```json
{
  "to": "阿嬤",
  "relation": "孙子/孙女",
  "words": "她总在巷口等我放学，最爱给我做橄榄菜配白粥，想跟她说辛苦了",
  "style": "warm"
}
```

> `style` 可选：`warm`（温情）、`fun`（幽默）、`formal`（正式）。

## 返回

```json
{
  "ok": true,
  "letter": "……（生成的信件正文）",
  "musicMood": "温暖怀旧的钢琴，带一点潮汕海风的笛声",
  "model": "hy3-preview"
}
```

## 部署

```bash
# 安装依赖
npm install

# 用云开发 CLI 部署（需先安装 @cloudbase/cli 并登录）
tcb fn deploy loveletter
```

部署后将函数发布为 HTTP 触发，前端（静态托管）即可调用。
