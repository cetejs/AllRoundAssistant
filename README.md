# 全能助手

日报 · 学习 · 工具，一站式助手

## 功能模块

- **日报**：每日记录与回顾，支持按日期筛选
- **学习**：学习笔记与资源管理，支持标签筛选
- **工具**：时间戳转换、JSON 格式化、Base64 编解码

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库（如 `AllRoundAssistant`）
2. 推送代码到 `main` 或 `master` 分支
3. 仓库 **Settings → Pages → Build and deployment**
   - Source 选择 **GitHub Actions**
4. 每次 push 后自动构建并部署
5. 访问：`https://<username>.github.io/AllRoundAssistant/`

## 技术栈

- Vue 3 + Vite
- Vue Router (hash 模式，适配 GitHub Pages)
- Tailwind CSS v4
