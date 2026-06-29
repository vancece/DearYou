# 云函数

本目录包含「给阿嬷的情书」项目的全部云函数，运行在腾讯云开发 CloudBase 上。

## 数据库结构

所有云函数共用一个 NoSQL 集合：**`letters`**

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 文档 ID（自动生成） |
| `to` | string | 收信人称呼，如 "阿嬤"、"妈妈" |
| `relation` | string | 与收信人的关系，如 "晚辈"、"女儿" |
| `style` | string | 信件风格：`warm`（温情）/ `fun`（幽默）/ `formal`（正式） |
| `letter` | string | AI 生成的情书正文 |
| `musicMood` | string | 配乐情绪关键词（≤30 字） |
| `musicUrl` | string \| null | 背景音乐 URL（待接入，目前为 null） |
| `public` | boolean | 是否公开到"公共树洞"，默认 false |
| `createdAt` | Date | 创建时间 |

## 云函数列表

### loveletter — 生成情书（核心函数）

接收用户输入，调用大模型（hy3-preview）生成情书，并写入数据库。

- **入参**：`to`、`relation`、`words`（想说的话）、`style`
- **出参**：`{ ok, id, letter, musicMood, musicUrl, model }`
- **操作**：`letters.add()`

### getletter — 读取单封信件

根据信件 ID 返回完整内容。

- **入参**：`id`
- **出参**：完整的 letter 文档
- **操作**：`letters.doc(id).get()`

### listletters — 分页列表

分页获取公共树洞的信件摘要列表。

- **入参**：`page`（默认 0）、`pageSize`（默认 10）
- **出参**：`{ ok, list: [{_id, to, relation, preview, createdAt}], hasMore }`
- **操作**：`letters.where({public: true}).orderBy('createdAt', 'desc')`

### publishletter — 公开/撤回

将信件投递到公共树洞或从树洞撤回。

- **入参**：`id`、`public`（默认 true）
- **出参**：`{ ok, public }`
- **操作**：`letters.doc(id).update({public})`

### countletters — 统计总数

统计公共树洞中的信件总数。

- **出参**：`{ ok, count }`
- **操作**：`letters.where({public: true}).count()`

## 函数协作流程

```
用户填写 ──▶ loveletter（AI生成 + 写入DB）
                  │
                  ▼
            返回 id + letter
                  │
      ┌───────────┼────────────┐
      ▼           ▼            ▼
  getletter   publishletter  listletters
 （查看全文）  （公开/撤回）  （树洞列表）
                                  │
                                  ▼
                            countletters
                            （信件计数）
```
