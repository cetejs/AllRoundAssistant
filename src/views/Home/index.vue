<script setup>
import { ref, computed } from 'vue'
import { modules } from '../../config/modules'
import ManifestHeader from '../../components/ManifestHeader.vue'

const filter = ref('all')
const filteredModules = computed(() => {
  if (filter.value === 'all') return modules
  return modules.filter((m) => m.id === filter.value)
})
</script>

<template>
  <div>
    <ManifestHeader
      title="MODULE MANIFEST"
      :subtitle="`// SECTION ID: ${filter === 'all' ? 'ALL' : filter.toUpperCase()}-01 // ITEMS: ${filteredModules.length}`"
      :show-search="false"
    />

    <!-- 筛选栏 -->
    <div class="flex flex-wrap gap-2 mb-6 px-6">
      <button
        class="font-mono-ui px-4 py-2 rounded-lg text-sm transition-colors"
        :class="filter === 'all'
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="filter = 'all'"
      >
        全部
      </button>
      <button
        v-for="m in modules"
        :key="m.id"
        class="font-mono-ui px-4 py-2 rounded-lg text-sm transition-colors"
        :class="filter === m.id
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'"
        @click="filter = m.id"
      >
        {{ m.icon }} {{ m.name }}
      </button>
    </div>

    <!-- MOGU 风格卡片网格 -->
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6 pb-8">
      <router-link
        v-for="m in filteredModules"
        :key="m.id"
        :to="m.path"
        class="group block p-5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="font-mono-ui text-xs text-slate-500 dark:text-slate-400">{{ m.ref }}</span>
          <span class="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ACTIVE
          </span>
        </div>
        <div class="flex items-center gap-2 mb-6">
          <span class="text-2xl">{{ m.icon }}</span>
          <div>
            <h2 class="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {{ m.name }}
            </h2>
            <p class="font-mono-ui text-xs text-slate-500 dark:text-slate-400 uppercase">
              {{ m.type }}
            </p>
          </div>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {{ m.description }}
        </p>
        <div class="flex items-center justify-between">
          <span class="font-mono-ui text-xs text-slate-400 dark:text-slate-500">TYPE: {{ m.type }}</span>
          <span class="font-mono-ui text-xs text-emerald-600 dark:text-emerald-400 group-hover:underline">
            ENTER →
          </span>
        </div>
      </router-link>
    </div>
  </div>
</template>
