import { supabase, isCloudEnabled } from './supabase.js'

/** 确保已登录（无 session 则匿名登录），返回是否可用 */
export async function ensureCloudAuth() {
  if (!supabase) return false
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return true
  const { error } = await supabase.auth.signInAnonymously()
  return !error
}

/** 当前用户信息：{ id, email, isAnonymous }，未登录为 null */
export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? null,
    isAnonymous: user.is_anonymous ?? true,
  }
}

/** 邮箱+密码登录（多端同账号，可看到同一份云端数据） */
export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('云端未配置')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** 邮箱+密码注册 */
export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('云端未配置')
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

/** 登出（下次进入会再匿名登录，数据仅本机） */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/** 从云端拉取文件夹列表 */
export async function fetchFoldersFromCloud() {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('document_folders')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }))
}

/** 从云端拉取文档列表 */
export async function fetchDocsFromCloud() {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content, folder_id, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    title: row.title || '无标题文档',
    content: row.content || '',
    folderId: row.folder_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }))
}

/** 将文件夹列表同步到云端（全量覆盖：先清空该用户云端文件夹，再写入当前列表，删除会生效） */
export async function syncFoldersToCloud(folders) {
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const rows = folders.map((f) => ({
    id: String(f.id),
    name: f.name,
    created_at: f.createdAt,
    user_id: user.id,
  }))
  await supabase.from('document_folders').delete().eq('user_id', user.id)
  if (rows.length > 0) {
    const { error } = await supabase.from('document_folders').insert(rows)
    if (error) throw error
  }
}

/** 将文档列表同步到云端（全量覆盖：先清空该用户云端文档，再写入当前列表，删除会生效） */
export async function syncDocsToCloud(docs) {
  if (!supabase) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const rows = docs.map((d) => ({
    id: Number(d.id),
    title: d.title || '无标题文档',
    content: d.content || '',
    folder_id: d.folderId ?? null,
    created_at: d.createdAt,
    updated_at: d.updatedAt || d.createdAt,
    user_id: user.id,
  }))
  await supabase.from('documents').delete().eq('user_id', user.id)
  if (rows.length > 0) {
    const { error } = await supabase.from('documents').insert(rows)
    if (error) throw error
  }
}

export { isCloudEnabled }
