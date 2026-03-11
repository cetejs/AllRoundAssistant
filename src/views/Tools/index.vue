<script setup>
import { ref } from 'vue'
import TimestampTool from './TimestampTool.vue'
import JsonTool from './JsonTool.vue'
import Base64Tool from './Base64Tool.vue'

const toolList = [
  { id: 'timestamp', name: '时间戳', icon: '⏱', component: TimestampTool },
  { id: 'json', name: 'JSON', icon: '📄', component: JsonTool },
  { id: 'base64', name: 'Base64', icon: '🔐', component: Base64Tool },
]
const filter = ref('all')
const activeTool = ref(null)

const showTool = (id) => {
  activeTool.value = id
  filter.value = id
}

const clearTool = () => {
  activeTool.value = null
  filter.value = 'all'
}
</script>

<template>
  <div>
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
        🔧 工具
      </h1>
      <p class="text-slate-600 dark:text-slate-300 text-sm">
        常用小工具集合
      </p>
    </header>

    <!-- 筛选栏：参考 MOGU filter=all -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="filter === 'all'
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="clearTool"
      >
        全部
      </button>
      <button
        v-for="t in toolList"
        :key="t.id"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="filter === t.id
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="showTool(t.id)"
      >
        {{ t.icon }} {{ t.name }}
      </button>
    </div>

    <!-- 全部：工具卡片网格 -->
    <div v-if="filter === 'all'" class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="t in toolList"
        :key="t.id"
        type="button"
        class="flex items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all text-left"
        @click="showTool(t.id)"
      >
        <span class="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
          {{ t.icon }}
        </span>
        <div>
          <h2 class="font-semibold text-slate-800 dark:text-slate-100">{{ t.name }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">点击使用</p>
        </div>
      </button>
    </div>

    <!-- 选中工具：展示工具内容 -->
    <div v-else class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6">
      <component :is="toolList.find((t) => t.id === filter)?.component" />
    </div>
  </div>
</template>
