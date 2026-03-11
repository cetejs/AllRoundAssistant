<script setup>
import { ref } from 'vue'
import Tesseract from 'tesseract.js'

const file = ref(null)
const fileUrl = ref('')
const text = ref('')
const loading = ref(false)
const error = ref('')
const progress = ref('')
const lang = ref('chi_sim+eng')
const fileInput = ref(null)

const onFileChange = (e) => {
  const f = e.target.files?.[0]
  if (!f || !f.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)
  file.value = f
  fileUrl.value = URL.createObjectURL(f)
  text.value = ''
  error.value = ''
}

const recognize = async () => {
  if (!file.value) {
    error.value = '请先选择图片'
    return
  }
  error.value = ''
  loading.value = true
  progress.value = ''
  try {
    const { data } = await Tesseract.recognize(file.value, lang.value, {
      logger: (m) => {
        if (m.status) progress.value = m.status
      },
    })
    text.value = data.text || '(未识别到文字)'
  } catch (e) {
    error.value = e?.message || '识别失败'
  } finally {
    loading.value = false
    progress.value = ''
  }
}

const copy = () => {
  if (!text.value) return
  navigator.clipboard.writeText(text.value).then(() => {
    error.value = ''
  }).catch(() => {
    error.value = '复制失败'
  })
}

const reset = () => {
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)
  file.value = null
  fileUrl.value = ''
  text.value = ''
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="space-y-4">
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
    <div>
      <label class="block text-sm text-slate-600 dark:text-slate-400 mb-1">识别语言</label>
      <select
        v-model="lang"
        class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
      >
        <option value="chi_sim+eng">简体中文 + 英文</option>
        <option value="chi_tra+eng">繁体中文 + 英文</option>
        <option value="eng">英文</option>
      </select>
    </div>
    <div v-if="fileUrl" class="flex gap-4">
      <img :src="fileUrl" alt="预览" class="max-h-48 rounded border border-slate-200 dark:border-slate-600" />
      <div class="flex-1 min-w-0">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50"
          :disabled="loading"
          @click="recognize"
        >
          {{ loading ? '识别中...' : '开始识别' }}
        </button>
        <button
          v-if="file"
          type="button"
          class="ml-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-400 text-sm"
          @click="reset"
        >
          清空
        </button>
      </div>
    </div>
    <p v-if="loading" class="text-sm text-slate-500 dark:text-slate-400">{{ progress || '加载中...' }}</p>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <div v-if="text" class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-600 dark:text-slate-400">识别结果</span>
        <button
          type="button"
          class="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
          @click="copy"
        >
          复制
        </button>
      </div>
      <textarea
        :value="text"
        readonly
        rows="8"
        class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-sm"
      />
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      首次使用需加载模型，支持中英文识别，本地处理不上传
    </p>
  </div>
</template>
