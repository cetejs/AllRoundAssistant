<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ManifestHeader from '../../components/ManifestHeader.vue'

const STORAGE_KEY = 'allround-documents'
const STORAGE_KEY_FOLDERS = 'allround-document-folders'
const docs = ref([])
const folders = ref([])
const currentId = ref(null)
const editingTitle = ref('')
const editingContent = ref('')
const listFilter = ref('')
const selectedFolderId = ref(null) // null = 全部，'uncategorized' = 未分类
const newFolderName = ref('')
const showNewFolder = ref(false)

const loadDocs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    docs.value = list.map((d) => ({
      ...d,
      folderId: d.folderId ?? null,
      updatedAt: d.updatedAt || d.createdAt,
    }))
  } catch {
    docs.value = []
  }
}

const loadFolders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDERS)
    folders.value = raw ? JSON.parse(raw) : []
  } catch {
    folders.value = []
  }
}

const saveDocs = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs.value))
}

const saveFolders = () => {
  localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders.value))
}

const currentDoc = computed(() => docs.value.find((d) => d.id === currentId.value))

const filteredDocs = computed(() => {
  let list = [...docs.value].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
  if (listFilter.value.trim()) {
    const q = listFilter.value.trim().toLowerCase()
    list = list.filter((d) => d.title.toLowerCase().includes(q) || (d.content && d.content.toLowerCase().includes(q)))
  } else if (selectedFolderId.value !== null) {
    if (selectedFolderId.value === 'uncategorized') {
      list = list.filter((d) => !d.folderId)
    } else {
      list = list.filter((d) => d.folderId === selectedFolderId.value)
    }
  }
  return list
})

const docCountInFolder = (folderId) => {
  if (folderId === 'uncategorized') return docs.value.filter((d) => !d.folderId).length
  if (folderId === null) return docs.value.length
  return docs.value.filter((d) => d.folderId === folderId).length
}

const formatTime = (iso) => {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 86400000 * 7) return `${Math.floor(diff / 86400000)} 天前`
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

const createDoc = () => {
  const folderId = selectedFolderId.value && selectedFolderId.value !== 'uncategorized' ? selectedFolderId.value : null
  const doc = {
    id: Date.now(),
    title: '无标题文档',
    content: '',
    folderId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  docs.value.unshift(doc)
  saveDocs()
  openDoc(doc.id)
}

const createFolder = () => {
  const name = newFolderName.value.trim()
  if (!name) return
  folders.value.push({
    id: 'folder-' + Date.now(),
    name,
    createdAt: new Date().toISOString(),
  })
  saveFolders()
  newFolderName.value = ''
  showNewFolder.value = false
  selectedFolderId.value = folders.value[folders.value.length - 1].id
}

const removeFolder = (id, e) => {
  e?.stopPropagation()
  docs.value.forEach((d) => {
    if (d.folderId === id) d.folderId = null
  })
  saveDocs()
  folders.value = folders.value.filter((f) => f.id !== id)
  saveFolders()
  if (selectedFolderId.value === id) selectedFolderId.value = null
}

const folderName = (id) => {
  if (id === 'uncategorized') return '未分类'
  const f = folders.value.find((x) => x.id === id)
  return f ? f.name : ''
}

const openDoc = (id) => {
  const doc = docs.value.find((d) => d.id === id)
  if (!doc) return
  currentId.value = id
  editingTitle.value = doc.title
  editingContent.value = doc.content || ''
}

const backToList = () => {
  saveCurrentDoc()
  currentId.value = null
  editingTitle.value = ''
  editingContent.value = ''
}

const saveCurrentDoc = () => {
  if (!currentId.value) return
  const doc = docs.value.find((d) => d.id === currentId.value)
  if (!doc) return
  doc.title = editingTitle.value.trim() || '无标题文档'
  doc.content = editingContent.value
  doc.updatedAt = new Date().toISOString()
  saveDocs()
}

const removeDoc = (id, e) => {
  e?.stopPropagation()
  docs.value = docs.value.filter((d) => d.id !== id)
  saveDocs()
  if (currentId.value === id) {
    currentId.value = null
    editingTitle.value = ''
    editingContent.value = ''
  }
}

watch([editingTitle, editingContent], () => {
  if (!currentId.value) return
  const doc = docs.value.find((d) => d.id === currentId.value)
  if (!doc) return
  doc.title = editingTitle.value.trim() || '无标题文档'
  doc.content = editingContent.value
  doc.updatedAt = new Date().toISOString()
  saveDocs()
}, { flush: 'post' })

onMounted(() => {
  loadDocs()
  loadFolders()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 列表页 -->
    <template v-if="currentId === null">
      <ManifestHeader title="文档" />
      <div class="flex flex-1 min-h-0 px-6 pb-8 gap-6">
        <!-- 文件夹侧栏 -->
        <aside class="w-52 shrink-0 flex flex-col gap-1">
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
            :class="selectedFolderId === null ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
            @click="selectedFolderId = null"
          >
            <span>📁</span>
            全部
            <span class="ml-auto text-slate-400 dark:text-slate-500">{{ docCountInFolder(null) }}</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
            :class="selectedFolderId === 'uncategorized' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
            @click="selectedFolderId = 'uncategorized'"
          >
            <span>📄</span>
            未分类
            <span class="ml-auto text-slate-400 dark:text-slate-500">{{ docCountInFolder('uncategorized') }}</span>
          </button>
          <div v-for="f in folders" :key="f.id" class="flex items-center gap-1 group">
            <button
              type="button"
              class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors min-w-0"
              :class="selectedFolderId === f.id ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
              @click="selectedFolderId = f.id"
            >
              <span>📁</span>
              <span class="truncate">{{ f.name }}</span>
              <span class="ml-auto text-slate-400 dark:text-slate-500 shrink-0">{{ docCountInFolder(f.id) }}</span>
            </button>
            <button
              type="button"
              class="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
              title="删除文件夹"
              @click="removeFolder(f.id, $event)"
            >
              ✕
            </button>
          </div>
          <div class="pt-2 border-t border-slate-200 dark:border-slate-600">
            <div v-if="showNewFolder" class="flex items-center gap-1 px-2">
              <input
                v-model="newFolderName"
                type="text"
                placeholder="文件夹名"
                class="flex-1 px-2 py-1.5 rounded border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                @keydown.enter="createFolder"
                @keydown.esc="showNewFolder = false; newFolderName = ''"
              />
              <button type="button" class="p-1.5 text-emerald-600 dark:text-emerald-400" @click="createFolder">✓</button>
              <button type="button" class="p-1.5 text-slate-400" @click="showNewFolder = false; newFolderName = ''">✕</button>
            </div>
            <button
              v-else
              type="button"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 w-full"
              @click="showNewFolder = true"
            >
              <span>+</span>
              新建文件夹
            </button>
          </div>
        </aside>

        <!-- 文档列表 -->
        <div class="flex-1 min-w-0 flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium transition-colors"
              @click="createDoc"
            >
              <span class="text-lg">+</span>
              新建文档
            </button>
            <input
              v-model="listFilter"
              type="text"
              placeholder="搜索文档..."
              class="flex-1 max-w-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div class="border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 overflow-hidden flex-1 min-h-0">
          <div class="divide-y divide-slate-200 dark:divide-slate-600">
            <button
              v-for="d in filteredDocs"
              :key="d.id"
              type="button"
              class="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              @click="openDoc(d.id)"
            >
              <span class="text-2xl text-slate-400 dark:text-slate-500 shrink-0">📄</span>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-800 dark:text-slate-100 truncate">{{ d.title }}</p>
                <p v-if="d.content" class="mt-0.5 text-sm text-slate-500 dark:text-slate-400 truncate">{{ d.content.replace(/\s+/g, ' ').trim() }}</p>
              </div>
              <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">{{ formatTime(d.updatedAt || d.createdAt) }}</span>
              <button
                type="button"
                class="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                title="删除"
                @click="removeDoc(d.id, $event)"
              >
                ✕
              </button>
            </button>
          </div>
          <div v-if="filteredDocs.length === 0" class="py-16 text-center text-slate-500 dark:text-slate-400">
            <p class="mb-1">{{ listFilter ? '未找到匹配的文档' : '暂无文档' }}</p>
            <p class="text-sm">{{ listFilter ? '尝试其他关键词' : '点击「新建文档」开始' }}</p>
          </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 文档编辑页（飞书式：标题 + 正文） -->
    <template v-else>
      <header class="sticky top-0 z-10 flex items-center gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-600 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <button
          type="button"
          class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          @click="backToList"
        >
          <span>←</span>
          文档
        </button>
        <span v-if="currentDoc" class="text-xs text-slate-400 dark:text-slate-500">
          {{ formatTime(currentDoc.updatedAt || currentDoc.createdAt) }} 更新
        </span>
      </header>

      <main class="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <input
          v-model="editingTitle"
          type="text"
          placeholder="无标题文档"
          class="w-full text-3xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 mb-2"
        />
        <textarea
          v-model="editingContent"
          placeholder="输入正文，支持多行..."
          rows="20"
          class="w-full text-base text-slate-700 dark:text-slate-200 bg-transparent border-0 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 leading-relaxed"
        />
      </main>
    </template>
  </div>
</template>
