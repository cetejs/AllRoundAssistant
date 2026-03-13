import { supabase, isCloudEnabled } from './supabase.js'

const ADMIN_SESSION_KEY = 'allround-admin'

const getAdminEmail = () => import.meta.env.VITE_SUPABASE_ADMIN_EMAIL || ''
const getAdminUid = () => import.meta.env.VITE_SUPABASE_ADMIN_UID || null
/** 管理员密码：与 VITE_SUPABASE_ADMIN_PASSWORD 一致即登录成功（默认 root） */
const getAdminPassword = () => import.meta.env.VITE_SUPABASE_ADMIN_PASSWORD || 'root'

/** 管理员登录：仅校验密码与 VITE_SUPABASE_ADMIN_PASSWORD 一致即可，无需邮箱/用户名 */
export async function adminSignIn(password) {
  const expected = getAdminPassword()
  if (!password || password !== expected) throw new Error('密码错误')
  if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
  if (supabase && getAdminEmail()) {
    try {
      await supabase.auth.signInWithPassword({ email: getAdminEmail(), password })
    } catch {
      // 仅密码登录已成功；Supabase 登录失败则不同步云端，仅本地编辑
    }
  }
}

/** 管理员登出 */
export async function adminSignOut() {
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(ADMIN_SESSION_KEY)
  if (supabase) await supabase.auth.signOut()
}

/** 当前是否为管理员（仅看是否通过密码登录过，存在 sessionStorage） */
export function checkIsAdmin() {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
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
