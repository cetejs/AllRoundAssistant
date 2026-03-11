<script setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')
const error = ref('')

const format = () => {
  error.value = ''
  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed, null, 2)
  } catch (e) {
    error.value = e.message || 'JSON 解析失败'
    output.value = ''
  }
}

const minify = () => {
  error.value = ''
  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed)
  } catch (e) {
    error.value = e.message || 'JSON 解析失败'
    output.value = ''
  }
}
</script>

<template>
  <div class="space-y-4">
    <textarea
      v-model="input"
      rows="8"
      placeholder='粘贴 JSON，如 {"a":1,"b":2}'
      class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-sm"
    />
    <div class="flex gap-2">
      <button
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        @click="format"
      >
        格式化
      </button>
      <button
        class="px-4 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-700"
        @click="minify"
      >
        压缩
      </button>
    </div>
    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    <pre v-if="output" class="p-3 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-sm overflow-x-auto">{{ output }}</pre>
  </div>
</template>
