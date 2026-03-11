<script setup>
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'

const mode = ref('merge') // merge | split | img2pdf
const error = ref('')
const loading = ref(false)

// 合并
const mergeFiles = ref([])
const mergeInput = ref(null)

// 拆分
const splitFile = ref(null)
const splitFileUrl = ref('')
const splitInput = ref(null)
const splitPages = ref('') // 如 "1,3,5" 或 "1-5"

// 图片转 PDF
const imgFiles = ref([])
const imgInput = ref(null)

const onMergeChange = (e) => {
  mergeFiles.value = Array.from(e.target.files || [])
}

const onSplitChange = (e) => {
  const f = e.target.files?.[0]
  if (!f || f.type !== 'application/pdf') {
    error.value = '请选择 PDF 文件'
    return
  }
  if (splitFileUrl.value) URL.revokeObjectURL(splitFileUrl.value)
  splitFile.value = f
  splitFileUrl.value = URL.createObjectURL(f)
  splitPages.value = ''
  error.value = ''
}

const onImgChange = (e) => {
  imgFiles.value = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'))
  if (imgFiles.value.length !== (e.target.files?.length || 0)) {
    error.value = '已过滤非图片文件'
  } else {
    error.value = ''
  }
}

const parsePageRange = (str, totalPages) => {
  const pages = new Set()
  const parts = str.split(/[,，\s]+/)
  for (const p of parts) {
    const m = p.match(/^(\d+)-(\d+)$/)
    if (m) {
      const a = Math.max(1, parseInt(m[1], 10))
      const b = Math.min(totalPages, parseInt(m[2], 10))
      for (let i = a; i <= b; i++) pages.add(i)
    } else {
      const n = parseInt(p, 10)
      if (n >= 1 && n <= totalPages) pages.add(n)
    }
  }
  return [...pages].sort((a, b) => a - b)
}

const doMerge = async () => {
  if (mergeFiles.value.length < 2) {
    error.value = '请选择至少 2 个 PDF 文件'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const merged = await PDFDocument.create()
    for (const file of mergeFiles.value) {
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const indices = src.getPageIndices()
      const copied = await merged.copyPages(src, indices)
      copied.forEach((p) => merged.addPage(p))
    }
    const pdfBytes = await merged.save()
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), '合并.pdf')
  } catch (e) {
    error.value = e?.message || '合并失败'
  } finally {
    loading.value = false
  }
}

const doSplit = async () => {
  if (!splitFile.value) {
    error.value = '请选择 PDF 文件'
    return
  }
  if (!splitPages.value.trim()) {
    error.value = '请输入要提取的页码，如 1,3,5 或 1-5'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const bytes = await splitFile.value.arrayBuffer()
    const src = await PDFDocument.load(bytes)
    const total = src.getPageCount()
    const indices = parsePageRange(splitPages.value, total)
    if (indices.length === 0) {
      error.value = '未匹配到有效页码'
      loading.value = false
      return
    }
    const newDoc = await PDFDocument.create()
    const pageIndices = indices.map((i) => i - 1)
    const copied = await newDoc.copyPages(src, pageIndices)
    copied.forEach((p) => newDoc.addPage(p))
    const pdfBytes = await newDoc.save()
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), '拆分.pdf')
  } catch (e) {
    error.value = e?.message || '拆分失败'
  } finally {
    loading.value = false
  }
}

const doImg2Pdf = async () => {
  if (imgFiles.value.length === 0) {
    error.value = '请选择至少 1 张图片'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const pdfDoc = await PDFDocument.create()
    for (const file of imgFiles.value) {
      const bytes = await file.arrayBuffer()
      let img
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        img = await pdfDoc.embedJpg(bytes)
      } else if (file.type === 'image/png') {
        img = await pdfDoc.embedPng(bytes)
      } else {
        continue
      }
      const page = pdfDoc.addPage([img.width, img.height])
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
    }
    const pdfBytes = await pdfDoc.save()
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), '图片转PDF.pdf')
  } catch (e) {
    error.value = e?.message || '转换失败，请确保为 JPG/PNG 格式'
  } finally {
    loading.value = false
  }
}

const downloadBlob = (blob, name) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

const resetMerge = () => {
  mergeFiles.value = []
  if (mergeInput.value) mergeInput.value.value = ''
}

const resetSplit = () => {
  if (splitFileUrl.value) URL.revokeObjectURL(splitFileUrl.value)
  splitFile.value = null
  splitFileUrl.value = ''
  splitPages.value = ''
  if (splitInput.value) splitInput.value.value = ''
}

const resetImg = () => {
  imgFiles.value = []
  if (imgInput.value) imgInput.value.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- 模式切换 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="m in [
          { id: 'merge', label: 'PDF 合并', icon: '📑' },
          { id: 'split', label: 'PDF 拆分', icon: '✂' },
          { id: 'img2pdf', label: '图片转 PDF', icon: '🖼' },
        ]"
        :key="m.id"
        type="button"
        class="px-4 py-2 rounded-lg text-sm transition-colors"
        :class="mode === m.id
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="mode = m.id; error = ''"
      >
        {{ m.icon }} {{ m.label }}
      </button>
    </div>

    <!-- PDF 合并 -->
    <div v-if="mode === 'merge'" class="space-y-4">
      <input
        ref="mergeInput"
        type="file"
        accept="application/pdf"
        multiple
        class="hidden"
        @change="onMergeChange"
      />
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
        @click="mergeInput?.click()"
      >
        选择 PDF 文件（可多选）
      </button>
      <p v-if="mergeFiles.length" class="text-sm text-slate-600 dark:text-slate-400">
        已选 {{ mergeFiles.length }} 个文件，按顺序合并
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50"
          :disabled="mergeFiles.length < 2 || loading"
          @click="doMerge"
        >
          {{ loading ? '处理中...' : '合并' }}
        </button>
        <button
          v-if="mergeFiles.length"
          type="button"
          class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-400 text-sm"
          @click="resetMerge"
        >
          清空
        </button>
      </div>
    </div>

    <!-- PDF 拆分 -->
    <div v-if="mode === 'split'" class="space-y-4">
      <input
        ref="splitInput"
        type="file"
        accept="application/pdf"
        class="hidden"
        @change="onSplitChange"
      />
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
        @click="splitInput?.click()"
      >
        选择 PDF 文件
      </button>
      <p v-if="splitFile" class="text-sm text-slate-600 dark:text-slate-400">
        {{ splitFile.name }}
      </p>
      <div>
        <label class="block text-sm text-slate-600 dark:text-slate-400 mb-1">提取页码</label>
        <input
          v-model="splitPages"
          type="text"
          placeholder="如 1,3,5 或 1-5"
          class="w-full max-w-xs px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
        />
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50"
          :disabled="!splitFile || !splitPages.trim() || loading"
          @click="doSplit"
        >
          {{ loading ? '处理中...' : '拆分' }}
        </button>
        <button
          v-if="splitFile"
          type="button"
          class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-400 text-sm"
          @click="resetSplit"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 图片转 PDF -->
    <div v-if="mode === 'img2pdf'" class="space-y-4">
      <input
        ref="imgInput"
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        multiple
        class="hidden"
        @change="onImgChange"
      />
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
        @click="imgInput?.click()"
      >
        选择图片（JPG/PNG，可多选）
      </button>
      <p v-if="imgFiles.length" class="text-sm text-slate-600 dark:text-slate-400">
        已选 {{ imgFiles.length }} 张图片，每张一页
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50"
          :disabled="imgFiles.length === 0 || loading"
          @click="doImg2Pdf"
        >
          {{ loading ? '处理中...' : '生成 PDF' }}
        </button>
        <button
          v-if="imgFiles.length"
          type="button"
          class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-400 text-sm"
          @click="resetImg"
        >
          清空
        </button>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      所有操作在本地完成，文件不会上传到服务器
    </p>
  </div>
</template>
