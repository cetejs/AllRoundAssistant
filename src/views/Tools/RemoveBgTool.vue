<script setup>
import { ref, computed } from 'vue'

const file = ref(null)
const fileUrl = ref('')
const resultUrl = ref('')
const loading = ref(false)
const error = ref('')

const fileInput = ref(null)

const hasFile = computed(() => !!file.value)

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
    const { default: removeBackground } = await import('@imgly/background-removal')
    const blob = await removeBackground(file.value)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = e.message || '抠图失败，请重试'
  } finally {
    loading.value = false
  }
}

const download = () => {
  if (!resultUrl.value) return
  const a = document.createElement('a')
  a.href = resultUrl.value
  a.download = `抠图_${file.value?.name || 'image'}.png`
  a.click()
}

const reset = () => {
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  file.value = null
  fileUrl.value = ''
  resultUrl.value = ''
  error.value = ''
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
      首次使用需加载模型，约 10–30 秒，请耐心等待
    </p>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <div class="grid gap-4 sm:grid-cols-2">
      <div v-if="fileUrl" class="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-700">
        <p class="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">原图</p>
        <img :src="fileUrl" alt="原图" class="w-full max-h-64 object-contain" />
      </div>
      <div v-if="resultUrl" class="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-700">
        <p class="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">抠图结果</p>
        <img :src="resultUrl" alt="抠图结果" class="w-full max-h-64 object-contain bg-[#f0f0f0] dark:bg-slate-600" />
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
