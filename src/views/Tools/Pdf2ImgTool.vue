<script setup>
import { ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const file = ref(null)
const loading = ref(false)
const error = ref('')
const progress = ref(0)
const imgUrls = ref([])
const fileInput = ref(null)

const onFileChange = (e) => {
  const f = e.target.files?.[0]
  if (!f || f.type !== 'application/pdf') {
    error.value = '请选择 PDF 文件'
    return
  }
  file.value = f
  imgUrls.value = []
  error.value = ''
}

const convert = async () => {
  if (!file.value) {
    error.value = '请先选择 PDF 文件'
    return
  }
  error.value = ''
  loading.value = true
  imgUrls.value = []
  const urls = []
  try {
    const data = await file.value.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data }).promise
    const total = pdf.numPages
    for (let i = 1; i <= total; i++) {
      progress.value = Math.round((i / total) * 100)
      const page = await pdf.getPage(i)
      const scale = 2
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise
      urls.push(canvas.toDataURL('image/png'))
    }
    imgUrls.value = urls
  } catch (e) {
    error.value = e?.message || '转换失败'
  } finally {
    loading.value = false
    progress.value = 0
  }
}

const downloadAll = () => {
  imgUrls.value.forEach((url, i) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `page_${i + 1}.png`
    a.click()
  })
}

const reset = () => {
  imgUrls.value = []
  file.value = null
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <input
      ref="fileInput"
      type="file"
      accept="application/pdf"
      class="hidden"
      @change="onFileChange"
    />
    <button
      type="button"
      class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
      @click="fileInput?.click()"
    >
      选择 PDF 文件
    </button>
    <p v-if="file" class="text-sm text-slate-600 dark:text-slate-400">{{ file.name }}</p>
    <div class="flex gap-2">
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50"
        :disabled="!file || loading"
        @click="convert"
      >
        {{ loading ? `转换中 ${progress}%` : '转换为图片' }}
      </button>
      <button
        v-if="imgUrls.length"
        type="button"
        class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-400 text-sm"
        @click="downloadAll"
      >
        下载全部 PNG
      </button>
      <button
        v-if="file"
        type="button"
        class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-400 text-sm"
        @click="reset"
      >
        清空
      </button>
    </div>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <div v-if="imgUrls.length" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div v-for="(url, i) in imgUrls" :key="i" class="rounded border border-slate-200 dark:border-slate-600 overflow-hidden">
        <img :src="url" :alt="`第${i + 1}页`" class="w-full h-auto" />
        <p class="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">第 {{ i + 1 }} 页</p>
      </div>
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      每页导出为 PNG，本地处理不上传
    </p>
  </div>
</template>
