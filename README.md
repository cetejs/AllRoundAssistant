# 全能助手

文档 · 学习 · 工具，一站式助手

## 功能模块

- **文档**：文档与笔记管理，支持按日期筛选
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

## 部署到 GitHub Pages（云端）

1. 在 GitHub 创建仓库（如 `AllRoundAssistant`），把本地代码推送到 `main` 或 `master` 分支。
2. 仓库 **Settings → Pages → Build and deployment**：
   - **Source** 选择 **GitHub Actions**。
3. 每次 push 到 `main`/`master` 会触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 自动构建并部署。
4. 访问：`https://<你的用户名>.github.io/AllRoundAssistant/`

**若希望线上站点也使用文档云端同步（Supabase）**：在仓库 **Settings → Secrets and variables → Actions** 中新增两个 Secrets：
- `VITE_SUPABASE_URL`：Supabase 项目 URL  
- `VITE_SUPABASE_ANON_KEY`：Supabase 匿名公钥  

保存后重新跑一次 Actions 或再 push 一次即可。未配置时线上版仍只使用本地存储。

## 文档云端同步（可选）

文档和文件夹默认保存在浏览器本地。若需多端同步，可接入 [Supabase](https://supabase.com)：

1. 在 [Supabase](https://supabase.com) 创建项目。
2. **Authentication → Providers** 中启用 **Anonymous** 登录。
3. **SQL Editor** 中执行 `supabase/schema.sql` 创建表与 RLS。
4. 在项目根目录创建 `.env`，参考 `.env.example` 填写：
   - `VITE_SUPABASE_URL`：项目 URL  
   - `VITE_SUPABASE_ANON_KEY`：匿名公钥  
5. 重新运行 `npm run dev` 或重新构建。文档页会先拉取云端数据，编辑后自动同步到云端（本地仍会备份到 localStorage）。

未配置上述环境变量时，仅使用本地存储，行为与之前一致。

## 技术栈

- Vue 3 + Vite
- Vue Router (hash 模式，适配 GitHub Pages)
- Tailwind CSS v4
- Supabase（可选，用于文档云端同步）
