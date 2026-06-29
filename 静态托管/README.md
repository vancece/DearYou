# 给阿嬤的情书 · 静态托管（React + Vite）

「给阿嬤的情书」的前端，React + Vite 工程，构建产物部署到云开发静态托管。

> 由 CodeBuddy 接入云开发自定义大模型 hy3-preview 开发。
> 文档：https://docs.cloudbase.net/ai/ai-tools/codebuddy

## 目录

```
静态托管/
├── index.html              # Vite 入口
├── package.json            # React 18 + Vite 5
├── vite.config.js          # base: './'，适配静态托管子目录
├── public/assets/          # 复古素材：bg/btn/check/dropdown-bg
└── src/
    ├── main.jsx            # 挂载入口
    ├── App.jsx             # 页面切换状态机（预留多页）
    ├── styles.css          # 全部样式（含背景图叠加层像素级对位）
    ├── data.js             # 关系/风格选项 + 本地示例文案
    ├── music.js            # 配乐引擎（Web Audio 合成 / 真实音频）
    └── pages/
        └── ComposePage.jsx # 写信页
```

## 开发

```bash
npm install
npm run dev      # http://localhost:4173
```

## 构建与部署

```bash
npm run build    # 产物输出到 dist/
tcb hosting deploy dist -e <你的环境ID>
```

## 说明

- 整张设计稿 `public/assets/bg.jpg` 作背景，表单为透明叠加层，按背景图百分比定位。
- 关系下拉、风格选择（温情/幽默/正式，默认温情）、字数计数、打字机呈现、Web Audio 配乐均已迁移为 React。
- 接后端：部署云函数后，在 `index.html` 注入 `window.LOVELETTER_API = '<云函数地址>'`，或改 `src/data.js` 的 `API_URL`。无后端时用内置示例文案预览。
- 页面切换：`src/App.jsx` 用状态机管理，新增页面在此登记。
