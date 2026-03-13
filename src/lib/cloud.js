import { supabase, isCloudEnabled } from './supabase.js'

const getAdminEmail = () => import.meta.env.VITE_SUPABASE_ADMIN_EMAIL || 'admin@allround.local'
const getAdminUid = () => import.meta.env.VITE_SUPABASE_ADMIN_UID || null
/** 管理员密码：默认 root，可通过 VITE_SUPABASE_ADMIN_PASSWORD 覆盖（需与 Supabase 中该用户密码一致） */
const getAdminPassword = () => import.meta.env.VITE_SUPABASE_ADMIN_PASSWORD || 'root'

/** 管理员登录（默认密码 root），仅当 password 正确时用管理员账号登录 Supabase */
export async function adminSignIn(password) {
  if (!supabase) throw new Error('云端未配置')
  const expected = getAdminPassword()
  if (!password || password !== expected) throw new Error('密码错误')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: getAdminEmail(),
    password: password,
  })
  if (error) throw error
  return data
}

/** 管理员登出 */
export async function adminSignOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/** 当前是否为管理员（已用管理员账号登录） */
export async function checkIsAdmin() {
  if (!supabase) return false
  const uid = getAdminUid()
  if (!uid) return false
  const { data: { user } } = await supabase.auth.getUser()
  return !!(user && user.id === uid)
}

/** 从云端拉取文件夹列表（管理员拉自己的，查看者拉管理员的） */
export async function fetchFoldersFromCloud() {
  if (!supabase) return []
  const uid = getAdminUid()
  if (!uid) return []
  const { data: { user } } = await supabase.auth.getUser()
  const readUid = user && user.id === uid ? user.id : uid
  const { data, error } = await supabase
    .from('document_folders')
    .select('id, name, created_at')
    .eq('user_id', readUid)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }))
}

/** 从云端拉取文档列表（管理员拉自己的，查看者拉管理员的） */
export async function fetchDocsFromCloud() {
  if (!supabase) return []
  const uid = getAdminUid()
  if (!uid) return []
  const { data: { user } } = await supabase.auth.getUser()
  const readUid = user && user.id === uid ? user.id : uid
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content, folder_id, created_at, updated_at')
    .eq('user_id', readUid)
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

/** 仅管理员可写：将文件夹列表同步到云端 */
export async function syncFoldersToCloud(folders) {
  if (!supabase) return
  const uid = getAdminUid()
  if (!uid) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== uid) return
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

/** 仅管理员可写：将文档列表同步到云端 */
export async function syncDocsToCloud(docs) {
  if (!supabase) return
  const uid = getAdminUid()
  if (!uid) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== uid) return
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
