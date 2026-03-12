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
    icon: '🖼',
    tools: [
      { id: 'img2text', name: '图片转文字', icon: '📝', component: Img2TextTool },
      { id: 'removebg', name: '抠图', icon: '✂', component: RemoveBgTool },
    ],
  },
  {
    id: 'pdf',
    name: 'PDF工具',
    icon: '📑',
    tools: [
      { id: 'pdf-split', name: 'PDF拆分', icon: '✂', component: PdfTool, props: { initialMode: 'split' } },
      { id: 'pdf-merge', name: 'PDF合并', icon: '📑', component: PdfTool, props: { initialMode: 'merge' } },
      { id: 'pdf-watermark', name: 'PDF加水印', icon: '💧', component: PdfTool, props: { initialMode: 'watermark' } },
    ],
  },
  {
    id: 'pdf-convert',
    name: 'PDF转换',
    icon: '🔄',
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
    icon: '📄',
    tools: [
      { id: 'word2pdf', name: 'Word转PDF', icon: '📘', component: Word2PdfTool },
      { id: 'img2pdf', name: '图片转PDF', icon: '🖼', component: PdfTool, props: { initialMode: 'img2pdf' } },
    ],
  },
]

const otherCategory = {
  id: 'other',
  name: '其他',
  icon: '🔧',
  tools: [
    { id: 'timestamp', name: '时间戳', icon: '⏱', desc: '时间戳与日期互转', component: TimestampTool },
    { id: 'json', name: 'JSON', icon: '📄', desc: 'JSON 格式化与压缩', component: JsonTool },
    { id: 'base64', name: 'Base64', icon: '🔐', desc: 'Base64 编解码', component: Base64Tool },
  ],
}

const allCategories = [...toolCategories, otherCategory]

const filter = ref('all') // 'all' | categoryId | toolId

const currentCategory = computed(() => {
  if (filter.value === 'all') return null
  const cat = allCategories.find((c) => c.id === filter.value)
  if (cat) return cat
  for (const c of allCategories) {
    if (c.tools.some((t) => t.id === filter.value)) return c
  }
  return null
})

const showCategory = (id) => {
  filter.value = id
}

const showTool = (id) => {
  filter.value = id
}

const backToCategory = () => {
  if (currentCategory.value) filter.value = currentCategory.value.id
}

const backToAll = () => {
  filter.value = 'all'
}

const getTool = (id) => {
  for (const cat of allCategories) {
    const t = cat.tools.find((x) => x.id === id)
    if (t) return t
  }
  return null
}

const isToolSelected = (id) => filter.value === id
const isCategorySelected = (id) => filter.value === id
</script>

<template>
  <div>
    <ManifestHeader title="工具" />

    <!-- 分类筛选栏：只显示分类 -->
    <div class="flex flex-wrap gap-2 mb-6 px-6">
      <button
        class="font-mono-ui px-4 py-2 rounded-lg text-sm transition-colors"
        :class="filter === 'all'
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="backToAll"
      >
        全部
      </button>
      <button
        v-for="cat in allCategories"
        :key="cat.id"
        class="font-mono-ui px-4 py-2 rounded-lg text-sm transition-colors"
        :class="(isCategorySelected(cat.id) || (currentCategory?.id === cat.id && getTool(filter)))
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="showCategory(cat.id)"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- 全部：按分类展示卡片 -->
    <div v-if="filter === 'all'" class="px-6 pb-8 space-y-8">
      <section v-for="cat in allCategories" :key="cat.id" class="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 p-5">
        <h2 class="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">
          <span>{{ cat.icon }}</span>
          {{ cat.name }}
        </h2>
        <div class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            v-for="t in cat.tools"
            :key="t.id"
            type="button"
            class="group flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all text-left"
            @click="showTool(t.id)"
          >
            <span class="text-2xl shrink-0">{{ t.icon }}</span>
            <div class="min-w-0">
              <div class="font-medium text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                {{ t.name }}
              </div>
              <p v-if="t.desc" class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ t.desc }}</p>
            </div>
          </button>
        </div>
      </section>
    </div>

    <!-- 选中分类：只显示该分类下的工具卡片 -->
    <div v-else-if="currentCategory && !getTool(filter)" class="px-6 pb-8">
      <section class="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 p-5">
        <h2 class="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">
          <span>{{ currentCategory.icon }}</span>
          {{ currentCategory.name }}
        </h2>
        <div class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            v-for="t in currentCategory.tools"
            :key="t.id"
            type="button"
            class="group flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all text-left"
            @click="showTool(t.id)"
          >
            <span class="text-2xl shrink-0">{{ t.icon }}</span>
            <div class="min-w-0">
              <div class="font-medium text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                {{ t.name }}
              </div>
              <p v-if="t.desc" class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ t.desc }}</p>
            </div>
          </button>
        </div>
      </section>
    </div>

    <!-- 选中工具：展示工具内容 -->
    <div v-else class="mx-6 mb-8">
      <div
        v-if="currentCategory"
        class="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400"
      >
        <button
          type="button"
          class="hover:text-emerald-600 dark:hover:text-emerald-400"
          @click="backToCategory"
        >
          ← {{ currentCategory.name }}
        </button>
        <span>/</span>
        <span class="text-slate-700 dark:text-slate-200">{{ getTool(filter)?.name }}</span>
      </div>
      <div class="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6">
        <component
          :is="getTool(filter)?.component"
          v-if="getTool(filter)"
          v-bind="getTool(filter)?.props || {}"
        />
      </div>
    </div>
  </div>
</template>
