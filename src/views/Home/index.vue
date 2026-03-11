<script setup>
import { ref, computed } from 'vue'
import { modules } from '../../config/modules'

const filter = ref('all')
const filteredModules = computed(() => {
  if (filter.value === 'all') return modules
  return modules.filter((m) => m.id === filter.value)
})
</script>

<template>
  <div>
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
        全能助手
      </h1>
      <p class="text-slate-600 dark:text-slate-300 text-sm">
        日报 · 学习 · 工具，一站式助手
      </p>
    </header>

    <!-- 筛选栏：参考 MOGU 工具库 filter=all 风格 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="filter === 'all'
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="filter = 'all'"
      >
        全部
      </button>
      <button
        v-for="m in modules"
        :key="m.id"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="filter === m.id
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="filter = m.id"
      >
        {{ m.icon }} {{ m.name }}
      </button>
    </div>

    <!-- 工具库风格网格：紧凑卡片 -->
    <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <router-link
        v-for="m in filteredModules"
        :key="m.id"
        :to="m.path"
        class="group flex flex-col items-center p-5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all"
      >
        <span class="text-3xl mb-2">{{ m.icon }}</span>
        <h2 class="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {{ m.name }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-center">
          {{ m.description }}
        </p>
      </router-link>
    </div>
  </div>
</template>
