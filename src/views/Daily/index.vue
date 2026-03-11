<script setup>
import { ref, computed, onMounted } from 'vue'
import ManifestHeader from '../../components/ManifestHeader.vue'

const STORAGE_KEY = 'allround-daily'
const entries = ref([])
const newContent = ref('')
const newDate = ref('')
const filterMode = ref('all') // all | today | week | custom
const filterDate = ref('')

const todayStr = () => new Date().toISOString().slice(0, 10)

const loadEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    entries.value = raw ? JSON.parse(raw) : []
  } catch {
    entries.value = []
  }
}

const saveEntries = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
}

const addEntry = () => {
  const content = newContent.value.trim()
  if (!content) return
  const date = newDate.value || todayStr()
  entries.value.unshift({
    id: Date.now(),
    date,
    content,
    createdAt: new Date().toISOString(),
  })
  newContent.value = ''
  newDate.value = ''
  saveEntries()
}

const removeEntry = (id) => {
  entries.value = entries.value.filter((e) => e.id !== id)
  saveEntries()
}

const setFilter = (mode, date = '') => {
  filterMode.value = mode
  filterDate.value = date
}

const filteredEntries = computed(() => {
  const list = entries.value
  if (filterMode.value === 'today') {
    return list.filter((e) => e.date === todayStr())
  }
  if (filterMode.value === 'week') {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    return list.filter((e) => {
      const d = new Date(e.date)
      return d >= weekAgo && d <= today
    })
  }
  if (filterMode.value === 'custom' && filterDate.value) {
    return list.filter((e) => e.date === filterDate.value)
  }
  return list
})

const groupedByDate = computed(() => {
  const map = new Map()
  for (const e of filteredEntries.value) {
    if (!map.has(e.date)) map.set(e.date, [])
    map.get(e.date).push(e)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
})

const formatDate = (str) => {
  const d = new Date(str)
  const today = new Date()
  const diff = Math.floor((today - d) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff} 天前`
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

onMounted(() => {
  loadEntries()
  newDate.value = todayStr()
})
</script>

<template>
  <div>
    <ManifestHeader title="日报" />

    <!-- 快速筛选 -->
    <div class="flex flex-wrap gap-2 mb-4 px-6">
      <button
        v-for="item in [
          { mode: 'all', label: '全部' },
          { mode: 'today', label: '今天' },
          { mode: 'week', label: '近7天' },
        ]"
        :key="item.mode"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="filterMode === item.mode
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="setFilter(item.mode)"
      >
        {{ item.label }}
      </button>
      <div class="flex items-center gap-2">
        <input
          v-model="filterDate"
          type="date"
          class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
          @change="(e) => setFilter('custom', e.target.value)"
        />
        <span class="text-xs text-slate-500 dark:text-slate-400">指定日期</span>
      </div>
    </div>

    <!-- 新增区域 -->
    <div class="mx-6 mb-6 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">记录内容</label>
          <textarea
            v-model="newContent"
            rows="2"
            placeholder="今日完成..."
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm resize-none focus:ring-2 focus:ring-emerald-500"
            @keydown.enter.ctrl="addEntry"
          />
        </div>
        <div class="w-36">
          <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">日期</label>
          <input
            v-model="newDate"
            type="date"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
          />
        </div>
        <button
          class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium"
          @click="addEntry"
        >
          添加
        </button>
      </div>
      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Ctrl+Enter 快速添加</p>
    </div>

    <!-- 按日期分组展示 -->
    <div class="px-6 pb-8">
      <div v-for="[date, items] in groupedByDate" :key="date" class="mb-6">
        <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
          <span>{{ formatDate(date) }}</span>
          <span class="text-slate-400 dark:text-slate-500">· {{ date }}</span>
        </h3>
        <ul class="space-y-2">
          <li
            v-for="e in items"
            :key="e.id"
            class="group flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500"
          >
            <p class="flex-1 text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">{{ e.content }}</p>
            <button
              class="flex-shrink-0 p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
              title="删除"
              @click="removeEntry(e.id)"
            >
              ✕
            </button>
          </li>
        </ul>
      </div>
      <div v-if="groupedByDate.length === 0" class="text-center py-16 text-slate-500 dark:text-slate-400">
        <p class="mb-2">暂无记录</p>
        <p class="text-sm">在上方输入内容并点击添加</p>
      </div>
    </div>
  </div>
</template>
