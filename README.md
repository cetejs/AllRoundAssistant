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

**若希望线上站点也使用文档云端同步与管理员权限**：在仓库 **Settings → Secrets and variables → Actions** 中新增：
- `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_ADMIN_EMAIL`（管理员邮箱，如 `admin@allround.local`）
- `VITE_SUPABASE_ADMIN_UID`（Supabase 中该管理员用户的 UUID）

保存后重新跑一次 Actions 或再 push 一次即可。未配置时线上版仍只使用本地存储。

## 文档云端同步与权限（可选）

文档和文件夹默认保存在浏览器本地。若需云端同步与「管理员编辑、其他人只读」：

1. 在 [Supabase](https://supabase.com) 创建项目。
2. **SQL Editor** 中执行 `supabase/schema.sql` 创建表与 RLS。
3. **Authentication → Users** 中手动添加用户：邮箱填 `admin@allround.local`（或自定），密码设为 **root**，创建后复制该用户的 **UUID**。
4. 在 **SQL Editor** 中执行（将 `你的管理员UUID` 替换为上一步的 UUID）：
   - `CREATE POLICY "document_folders_select_anon" ON document_folders FOR SELECT TO anon USING (user_id = '你的管理员UUID');`
   - `CREATE POLICY "documents_select_anon" ON documents FOR SELECT TO anon USING (user_id = '你的管理员UUID');`
5. 在项目根目录创建 `.env`，参考 `.env.example` 填写 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`VITE_SUPABASE_ADMIN_EMAIL`、`VITE_SUPABASE_ADMIN_UID`。
6. 重新运行 `npm run dev` 或重新构建。

**权限**：未登录或未以管理员登录时为**只读**（可看文档列表与内容）。点击「管理员登录」并输入默认密码 **root** 后获得编辑权限（新建/删除/移动文档与文件夹，编辑内容并同步云端）。

## 技术栈

- Vue 3 + Vite
- Vue Router (hash 模式，适配 GitHub Pages)
- Tailwind CSS v4
- Supabase（可选，用于文档云端同步）
