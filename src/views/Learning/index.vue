<script setup>
import { ref, onMounted, computed } from 'vue'
import ManifestHeader from '../../components/ManifestHeader.vue'

const STORAGE_KEY = 'allround-learning'
const items = ref([])
const newTitle = ref('')
const newLink = ref('')
const newTag = ref('')
const filterTag = ref('')

const loadItems = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    items.value = raw ? JSON.parse(raw) : []
  } catch {
    items.value = []
  }
}

const saveItems = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
}

const addItem = () => {
  const title = newTitle.value.trim()
  if (!title) return
  items.value.unshift({
    id: Date.now(),
    title,
    link: newLink.value.trim() || null,
    tag: newTag.value.trim() || '未分类',
    createdAt: new Date().toISOString(),
  })
  newTitle.value = ''
  newLink.value = ''
  newTag.value = ''
  saveItems()
}

const removeItem = (id) => {
  items.value = items.value.filter((i) => i.id !== id)
  saveItems()
}

const allTags = computed(() => {
  const set = new Set()
  items.value.forEach((i) => set.add(i.tag))
  return [...set].sort()
})

const filteredItems = computed(() => {
  if (!filterTag.value) return items.value
  return items.value.filter((i) => i.tag === filterTag.value)
})

onMounted(loadItems)
</script>

<template>
  <div>
    <ManifestHeader
      title="LEARNING"
      subtitle="// SECTION ID: LRN-01 // 学习笔记与资源"
    />

    <div class="mb-6 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 space-y-3 mx-6">
      <div class="flex flex-wrap gap-3">
        <input
          v-model="newTitle"
          type="text"
          placeholder="标题"
          class="flex-1 min-w-[120px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />
        <input
          v-model="newLink"
          type="url"
          placeholder="链接（可选）"
          class="flex-1 min-w-[120px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />
        <input
          v-model="newTag"
          type="text"
          placeholder="标签"
          class="w-24 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />
        <button
          class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          @click="addItem"
        >
          添加
        </button>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap gap-2 px-6">
      <button
        class="px-3 py-1 rounded-full text-sm transition-colors"
        :class="!filterTag
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
        @click="filterTag = ''"
      >
        全部
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        class="px-3 py-1 rounded-full text-sm transition-colors"
        :class="filterTag === tag
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100'"
        @click="filterTag = tag"
      >
        {{ tag }}
      </button>
    </div>

    <ul class="space-y-3 px-6 pb-8">
      <li
        v-for="i in filteredItems"
        :key="i.id"
        class="flex items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      >
        <div>
          <span class="text-xs text-slate-500 dark:text-slate-300">{{ i.tag }}</span>
          <a
            v-if="i.link"
            :href="i.link"
            target="_blank"
            rel="noopener"
            class="block text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {{ i.title }}
          </a>
          <span v-else class="text-slate-800 dark:text-slate-100">{{ i.title }}</span>
        </div>
        <button
          class="text-red-500 hover:text-red-600 text-sm"
          @click="removeItem(i.id)"
        >
          删除
        </button>
      </li>
      <li v-if="filteredItems.length === 0" class="text-center py-12 text-slate-500 dark:text-slate-300">
        暂无学习笔记，添加第一条吧
      </li>
    </ul>
  </div>
</template>
