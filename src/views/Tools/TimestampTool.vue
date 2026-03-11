<script setup>
import { ref, computed } from 'vue'

const mode = ref('toDate')
const input = ref('')
const output = ref('')
const useUTC = ref(false)

const result = computed(() => {
  if (!input.value.trim()) return ''
  if (mode.value === 'toDate') {
    const ts = parseInt(input.value, 10)
    if (isNaN(ts)) return '无效时间戳'
    const d = ts < 1e12 ? new Date(ts * 1000) : new Date(ts)
    if (isNaN(d.getTime())) return '无效时间戳'
    return useUTC.value
      ? d.toLocaleString('zh-CN', { timeZone: 'UTC' }) + ' (UTC)'
      : d.toLocaleString('zh-CN')
  }
  const str = input.value.trim()
  let parseStr = str
  if (useUTC.value) {
    const s = str.replace(' ', 'T')
    parseStr = (s.includes('T') ? s : s + 'T00:00:00') + 'Z'
  }
  const d = new Date(parseStr)
  return isNaN(d.getTime()) ? '' : String(Math.floor(d.getTime() / 1000))
})

const update = () => {
  output.value = result.value
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-4 text-slate-800 dark:text-slate-100">
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="mode" type="radio" value="toDate" class="accent-indigo-600" />
        <span>时间戳 → 日期</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="mode" type="radio" value="toTimestamp" class="accent-indigo-600" />
        <span>日期 → 时间戳</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer ml-auto">
        <input v-model="useUTC" type="checkbox" class="accent-indigo-600 rounded" />
        <span>使用 UTC</span>
      </label>
    </div>
    <div>
      <input
        v-model="input"
        type="text"
        :placeholder="mode === 'toDate' ? '输入时间戳（秒或毫秒）' : '输入日期，如 2025-03-11 12:00:00'"
        class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
        @input="update"
      />
    </div>
    <div>
      <button
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        @click="update"
      >
        转换
      </button>
    </div>
    <div v-if="output" class="p-3 rounded bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-mono">
      {{ output }}
    </div>
  </div>
</template>
