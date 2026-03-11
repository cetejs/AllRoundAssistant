<script setup>
import { ref } from 'vue'
import TimestampTool from './TimestampTool.vue'
import JsonTool from './JsonTool.vue'
import Base64Tool from './Base64Tool.vue'

const tabs = [
  { id: 'timestamp', name: '时间戳', component: TimestampTool },
  { id: 'json', name: 'JSON', component: JsonTool },
  { id: 'base64', name: 'Base64', component: Base64Tool },
]
const activeTab = ref('timestamp')
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
      🔧 全能助手
    </h1>

    <div class="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors"
        :class="activeTab === t.id
          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-600'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'"
        @click="activeTab = t.id"
      >
        {{ t.name }}
      </button>
    </div>

    <div class="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <component :is="tabs.find((t) => t.id === activeTab)?.component" />
    </div>
  </div>
</template>
