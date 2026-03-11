<script setup>
import { ref, computed } from 'vue'

const file = ref(null)
const fileUrl = ref('')
const resultUrl = ref('')
const loading = ref(false)
const error = ref('')
const selectedBg = ref('transparent')

const fileInput = ref(null)

const bgOptions = [
  { id: 'transparent', label: '透明', style: 'checkerboard' },
  { id: 'white', label: '白色', color: '#ffffff' },
  { id: 'red', label: '红色', color: '#ef4444' },
  { id: 'gray', label: '浅灰', color: '#d1d5db' },
  { id: 'blue', label: '蓝色', color: '#3b82f6' },
  { id: 'gradient', label: '渐变', style: 'linear-gradient(to right, #3b82f6, #ffffff)' },
]

const hasFile = computed(() => !!file.value)

const resultBgStyle = computed(() => {
  const opt = bgOptions.find((o) => o.id === selectedBg.value)
  if (!opt) return {}
  if (opt.style === 'checkerboard') {
    return {
      backgroundColor: '#e5e5e5',
      backgroundImage: `
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%)
      `,
      backgroundSize: '8px 8px',
      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    }
  }
  if (opt.style?.startsWith('linear-gradient')) {
    return { background: opt.style }
  }
  return { backgroundColor: opt.color || '#fff' }
})

const onFileChange = (e) => {
  error.value = ''
  resultUrl.value = ''
  const f = e.target.files?.[0]
  if (!f) return
  if (!f.type.startsWith('image/')) {
    error.value = '请选择图片文件（JPG、PNG 等）'
    return
  }
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)
  file.value = f
  fileUrl.value = URL.createObjectURL(f)
}

const process = async () => {
  if (!file.value) {
    error.value = '请先选择图片'
    return
  }
  error.value = ''
  loading.value = true
  resultUrl.value = ''
  try {
    const { removeBackground } = await import('@imgly/background-removal')
    const blob = await removeBackground(file.value, { proxyToWorker: true })
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = e.message || '抠图失败，请重试'
  } finally {
    loading.value = false
  }
}

const download = async () => {
  if (!resultUrl.value) return
  const opt = bgOptions.find((o) => o.id === selectedBg.value)
  if (!opt || opt.id === 'transparent') {
    const a = document.createElement('a')
    a.href = resultUrl.value
    a.download = `抠图_${file.value?.name || 'image'}.png`
    a.click()
    return
  }
  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = resultUrl.value
    })
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (opt.style?.startsWith('linear-gradient')) {
      const g = ctx.createLinearGradient(0, 0, canvas.width, 0)
      g.addColorStop(0, '#3b82f6')
      g.addColorStop(1, '#ffffff')
      ctx.fillStyle = g
    } else {
      ctx.fillStyle = opt.color || '#fff'
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `抠图_${file.value?.name || 'image'}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (e) {
    const a = document.createElement('a')
    a.href = resultUrl.value
    a.download = `抠图_${file.value?.name || 'image'}.png`
    a.click()
  }
}

const reset = () => {
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  file.value = null
  fileUrl.value = ''
  resultUrl.value = ''
  error.value = ''
  selectedBg.value = 'transparent'
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-4 items-center">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
        @click="fileInput?.click()"
      >
        选择图片
      </button>
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50"
        :disabled="!hasFile || loading"
        @click="process"
      >
        {{ loading ? '处理中...' : '开始抠图' }}
      </button>
      <button
        v-if="hasFile"
        type="button"
        class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
        @click="reset"
      >
        重置
      </button>
    </div>

    <p v-if="loading" class="text-sm text-slate-500 dark:text-slate-400">
      图像生成中，可继续操作页面…
    </p>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <div v-if="resultUrl" class="space-y-2">
      <p class="text-sm text-slate-600 dark:text-slate-300">选择背景:</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in bgOptions"
          :key="opt.id"
          type="button"
          class="w-10 h-10 rounded border-2 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          :class="selectedBg === opt.id ? 'border-slate-900 dark:border-white scale-105' : 'border-slate-300 dark:border-slate-500 hover:border-slate-500 dark:hover:border-slate-400'"
          :style="opt.style === 'checkerboard' ? {
            backgroundColor: '#e5e5e5',
            backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          } : opt.style?.startsWith('linear-gradient') ? { background: opt.style } : { backgroundColor: opt.color }"
          :title="opt.label"
          @click="selectedBg = opt.id"
        />
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div v-if="fileUrl" class="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-700">
        <p class="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">原图</p>
        <img :src="fileUrl" alt="原图" class="w-full max-h-64 object-contain" />
      </div>
      <div v-if="resultUrl" class="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden" :style="resultBgStyle">
        <p class="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">抠图结果</p>
        <img :src="resultUrl" alt="抠图结果" class="w-full max-h-64 object-contain" />
        <span class="block px-3 py-2">
          <button
            type="button"
            class="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            @click="download"
          >
            下载 PNG
          </button>
        </span>
      </div>
    </div>

    <p class="text-xs text-slate-500 dark:text-slate-400">
      支持 JPG、PNG 等格式，图片在本地处理，不会上传到服务器
    </p>
  </div>
</template>
