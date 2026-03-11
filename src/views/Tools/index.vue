<script setup>
import { ref, computed } from 'vue'
import TimestampTool from './TimestampTool.vue'
import JsonTool from './JsonTool.vue'
import Base64Tool from './Base64Tool.vue'
import RemoveBgTool from './RemoveBgTool.vue'
import Img2TextTool from './Img2TextTool.vue'
import PdfTool from './PdfTool.vue'
import Pdf2ImgTool from './Pdf2ImgTool.vue'
import Word2PdfTool from './Word2PdfTool.vue'
import PlaceholderTool from './PlaceholderTool.vue'
import ManifestHeader from '../../components/ManifestHeader.vue'

const toolCategories = [
  {
    id: 'image',
    name: '图片工具',
    tools: [
      { id: 'img2text', name: '图片转文字', icon: '📝', component: Img2TextTool },
      { id: 'removebg', name: '抠图', icon: '✂', component: RemoveBgTool },
    ],
  },
  {
    id: 'pdf',
    name: 'PDF工具',
    tools: [
      { id: 'pdf-split', name: 'PDF拆分', icon: '✂', component: PdfTool, props: { initialMode: 'split' } },
      { id: 'pdf-merge', name: 'PDF合并', icon: '📑', component: PdfTool, props: { initialMode: 'merge' } },
      { id: 'pdf-watermark', name: 'PDF加水印', icon: '💧', component: PdfTool, props: { initialMode: 'watermark' } },
    ],
  },
  {
    id: 'pdf-convert',
    name: 'PDF转换',
    tools: [
      { id: 'pdf2word', name: 'PDF转Word', icon: '📘', component: PlaceholderTool, props: { name: 'PDF转Word', desc: '该功能需要服务端支持，敬请期待' } },
      { id: 'pdf2excel', name: 'PDF转Excel', icon: '📗', component: PlaceholderTool, props: { name: 'PDF转Excel', desc: '该功能需要服务端支持，敬请期待' } },
      { id: 'pdf2ppt', name: 'PDF转PPT', icon: '📙', component: PlaceholderTool, props: { name: 'PDF转PPT', desc: '该功能需要服务端支持，敬请期待' } },
      { id: 'pdf2img', name: 'PDF转图片', icon: '🖼', component: Pdf2ImgTool },
    ],
  },
  {
    id: 'to-pdf',
    name: '转换成PDF',
    tools: [
      { id: 'word2pdf', name: 'Word转PDF', icon: '📘', component: Word2PdfTool },
      { id: 'img2pdf', name: '图片转PDF', icon: '🖼', component: PdfTool, props: { initialMode: 'img2pdf' } },
    ],
  },
]

const otherTools = [
  { id: 'timestamp', name: '时间戳', icon: '⏱', desc: '时间戳与日期互转', component: TimestampTool },
  { id: 'json', name: 'JSON', icon: '📄', desc: 'JSON 格式化与压缩', component: JsonTool },
  { id: 'base64', name: 'Base64', icon: '🔐', desc: 'Base64 编解码', component: Base64Tool },
]

const allTools = computed(() => {
  const list = []
  toolCategories.forEach((cat) => cat.tools.forEach((t) => list.push({ ...t, category: cat.name })))
  otherTools.forEach((t) => list.push({ ...t, category: '其他' }))
  return list
})

const filter = ref('all')

const showTool = (id) => {
  filter.value = id
}

const clearTool = () => {
  filter.value = 'all'
}

const getTool = (id) => {
  for (const cat of toolCategories) {
    const t = cat.tools.find((x) => x.id === id)
    if (t) return t
  }
  return otherTools.find((x) => x.id === id)
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
      <template v-for="cat in toolCategories" :key="cat.id">
        <button
          v-for="t in cat.tools"
          :key="t.id"
          class="font-mono-ui px-4 py-2 rounded-lg text-sm transition-colors"
          :class="filter === t.id
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
          @click="showTool(t.id)"
        >
          {{ t.icon }} {{ t.name }}
        </button>
      </template>
      <button
        v-for="t in otherTools"
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

    <!-- 全部：分类卡片 -->
    <div v-if="filter === 'all'" class="px-6 pb-8 space-y-6">
      <div v-for="cat in toolCategories" :key="cat.id">
        <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">{{ cat.name }}</h3>
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="t in cat.tools"
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
          </button>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">其他</h3>
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="t in otherTools"
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
            <p class="text-sm text-slate-600 dark:text-slate-300">{{ t.desc }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- 选中工具：展示工具内容 -->
    <div v-else class="mx-6 mb-8 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6">
      <component
        :is="getTool(filter)?.component"
        v-if="getTool(filter)"
        v-bind="getTool(filter)?.props || {}"
      />
    </div>
  </div>
</template>
