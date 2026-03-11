<script setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'allround-daily'
const entries = ref([])
const newContent = ref('')
const filterDate = ref('')

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
  entries.value.unshift({
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    content,
    createdAt: new Date().toISOString(),
  })
  newContent.value = ''
  saveEntries()
}

const removeEntry = (id) => {
  entries.value = entries.value.filter((e) => e.id !== id)
  saveEntries()
}

const filteredEntries = () => {
  if (!filterDate.value) return entries.value
  return entries.value.filter((e) => e.date === filterDate.value)
}

onMounted(loadEntries)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
      📋 日报
    </h1>

    <div class="mb-6 flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">新增记录</label>
        <div class="flex gap-2">
          <input
            v-model="newContent"
            type="text"
            placeholder="今日完成..."
            class="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            @keyup.enter="addEntry"
          />
          <button
            class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            @click="addEntry"
          >
            添加
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">按日期筛选</label>
        <input
          v-model="filterDate"
          type="date"
          class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
        />
      </div>
    </div>

    <ul class="space-y-3">
      <li
        v-for="e in filteredEntries()"
        :key="e.id"
        class="flex items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      >
        <div>
          <span class="text-sm text-slate-500 dark:text-slate-300">{{ e.date }}</span>
          <p class="text-slate-800 dark:text-slate-100">{{ e.content }}</p>
        </div>
        <button
          class="text-red-500 hover:text-red-600 text-sm"
          @click="removeEntry(e.id)"
        >
          删除
        </button>
      </li>
      <li v-if="filteredEntries().length === 0" class="text-center py-12 text-slate-500 dark:text-slate-300">
        暂无记录，添加第一条日报吧
      </li>
    </ul>
  </div>
</template>
