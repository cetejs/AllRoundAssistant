-- 文档云端同步表结构（Supabase）
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 1. 启用匿名登录（在 Authentication → Providers 中勾选 Anonymous）
-- 2. 创建表与 RLS

-- 文件夹表
CREATE TABLE IF NOT EXISTS document_folders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 文档表（id 与前端生成的 Date.now() 一致，用 BIGINT）
-- folder_id 仅存储前端文件夹 id 字符串，不做外键约束以便同步顺序灵活
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id TEXT,
  title TEXT NOT NULL DEFAULT '无标题文档',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 行级安全（RLS）
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 仅允许当前用户读写自己的数据
CREATE POLICY "document_folders_select" ON document_folders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "document_folders_insert" ON document_folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "document_folders_update" ON document_folders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "document_folders_delete" ON document_folders
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_update" ON documents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "documents_delete" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- 查看者只读：允许匿名用户读取管理员的数据（需先创建管理员用户，将其 user_id 填入下方）
-- 在 Supabase Dashboard → Authentication → Users 中创建用户（如 admin@allround.local / root），复制其 UUID，执行：
-- CREATE POLICY "document_folders_select_anon" ON document_folders FOR SELECT TO anon USING (user_id = '你的管理员UUID');
-- CREATE POLICY "documents_select_anon" ON documents FOR SELECT TO anon USING (user_id = '你的管理员UUID');
