<script setup>
import { ref, computed } from 'vue'

const mode = ref('toDate')
const input = ref('')
const output = ref('')

const result = computed(() => {
  if (!input.value.trim()) return ''
  if (mode.value === 'toDate') {
    const ts = parseInt(input.value, 10)
    if (isNaN(ts)) return '无效时间戳'
    const d = ts < 1e12 ? new Date(ts * 1000) : new Date(ts)
    return isNaN(d.getTime()) ? '无效时间戳' : d.toLocaleString('zh-CN')
  }
  const d = new Date(input.value)
  return isNaN(d.getTime()) ? '' : String(Math.floor(d.getTime() / 1000))
})

const update = () => {
  output.value = result.value
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4">
      <label class="flex items-center gap-2">
        <input v-model="mode" type="radio" value="toDate" />
        <span>时间戳 → 日期</span>
      </label>
      <label class="flex items-center gap-2">
        <input v-model="mode" type="radio" value="toTimestamp" />
        <span>日期 → 时间戳</span>
      </label>
    </div>
    <div>
      <input
        v-model="input"
        type="text"
        :placeholder="mode === 'toDate' ? '输入时间戳（秒或毫秒）' : '输入日期，如 2025-03-11 12:00:00'"
        class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
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
    <div v-if="output" class="p-3 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono">
      {{ output }}
    </div>
  </div>
</template>
