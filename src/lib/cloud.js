import { supabase, isCloudEnabled } from './supabase.js'

/** 确保已匿名登录，返回是否可用 */
export async function ensureCloudAuth() {
  if (!supabase) return false
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return true
  const { error } = await supabase.auth.signInAnonymously()
  return !error
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

/** 将文件夹列表同步到云端（全量覆盖当前用户） */
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
  if (rows.length === 0) {
    const { data: existing } = await supabase.from('document_folders').select('id').eq('user_id', user.id)
    if (existing?.length) {
      await supabase.from('document_folders').delete().eq('user_id', user.id)
    }
    return
  }
  const { error } = await supabase.from('document_folders').upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
  })
  if (error) throw error
}

/** 将文档列表同步到云端（全量覆盖当前用户） */
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
  if (rows.length === 0) {
    const { data: existing } = await supabase.from('documents').select('id').eq('user_id', user.id)
    if (existing?.length) {
      await supabase.from('documents').delete().eq('user_id', user.id)
    }
    return
  }
  const { error } = await supabase.from('documents').upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
  })
  if (error) throw error
}

export { isCloudEnabled }
