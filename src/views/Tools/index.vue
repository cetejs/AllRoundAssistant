<script setup>
import { ref } from 'vue'
import TimestampTool from './TimestampTool.vue'
import JsonTool from './JsonTool.vue'
import Base64Tool from './Base64Tool.vue'
import RemoveBgTool from './RemoveBgTool.vue'
import PdfTool from './PdfTool.vue'
import ManifestHeader from '../../components/ManifestHeader.vue'

const toolList = [
  { id: 'timestamp', name: '时间戳', icon: '⏱', desc: '时间戳与日期互转', component: TimestampTool },
  { id: 'json', name: 'JSON', icon: '📄', desc: 'JSON 格式化与压缩', component: JsonTool },
  { id: 'base64', name: 'Base64', icon: '🔐', desc: 'Base64 编解码', component: Base64Tool },
  { id: 'removebg', name: '抠图', icon: '✂', desc: 'AI 智能去除图片背景', component: RemoveBgTool },
  { id: 'pdf', name: 'PDF', icon: '📕', desc: 'PDF 合并、拆分、图片转 PDF', component: PdfTool },
]
const filter = ref('all')

const showTool = (id) => {
  filter.value = id
}

const clearTool = () => {
  filter.value = 'all'
}
</script>

<template>
  <div>
    <ManifestHeader title="工具" />

    <!-- 筛选栏 -->
    <div class="flex flex-wrap gap-2 mb-6 px-6">
      <button
        class="font-mono-ui px-4 py-2 rounded-lg text-sm transition-colors"
        :class="filter === 'all'
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="clearTool"
      >
        全部
      </button>
      <button
        v-for="t in toolList"
        :key="t.id"
        class="font-mono-ui px-4 py-2 rounded-lg text-sm transition-colors"
        :class="filter === t.id
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="showTool(t.id)"
      >
        {{ t.icon }} {{ t.name }}
      </button>
    </div>

    <!-- 全部：MOGU 风格工具卡片 -->
    <div v-if="filter === 'all'" class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6 pb-8">
      <button
        v-for="t in toolList"
        :key="t.id"
        type="button"
        class="group block p-5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all text-left"
        @click="showTool(t.id)"
      >
        <div class="flex items-center gap-2 mb-3">
          <span class="text-2xl">{{ t.icon }}</span>
          <h2 class="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            {{ t.name }}
          </h2>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          {{ t.desc }}
        </p>
      </button>
    </div>

    <!-- 选中工具：展示工具内容 -->
    <div v-else class="mx-6 mb-8 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6">
      <component :is="toolList.find((t) => t.id === filter)?.component" />
    </div>
  </div>
</template>
