<script setup>
import { ref } from 'vue'

const mode = ref('encode')
const input = ref('')
const output = ref('')
const error = ref('')

const convert = () => {
  error.value = ''
  try {
    if (mode.value === 'encode') {
      output.value = btoa(unescape(encodeURIComponent(input.value)))
    } else {
      output.value = decodeURIComponent(escape(atob(input.value)))
    }
  } catch (e) {
    error.value = e.message || '转换失败'
    output.value = ''
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4">
      <label class="flex items-center gap-2">
        <input v-model="mode" type="radio" value="encode" />
        <span>编码</span>
      </label>
      <label class="flex items-center gap-2">
        <input v-model="mode" type="radio" value="decode" />
        <span>解码</span>
      </label>
    </div>
    <textarea
      v-model="input"
      rows="4"
      :placeholder="mode === 'encode' ? '输入原文' : '输入 Base64 字符串'"
      class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-sm"
    />
    <button
      class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
      @click="convert"
    >
      {{ mode === 'encode' ? '编码' : '解码' }}
    </button>
    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    <pre v-if="output" class="p-3 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all">{{ output }}</pre>
  </div>
</template>
