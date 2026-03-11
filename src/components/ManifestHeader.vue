<script setup>
defineProps({
  title: { type: String, default: 'MANIFEST' },
  subtitle: { type: String, default: '' },
  showSearch: { type: Boolean, default: false },
})
</script>

<template>
  <header class="flex items-center justify-between gap-4 mb-6 px-6 pt-6">
    <div>
      <h1 class="font-mono-ui text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="font-mono-ui text-sm text-slate-500 dark:text-slate-400 mt-0.5">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="showSearch" class="flex items-center gap-2">
      <button
        type="button"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span>🔍</span>
        <span>搜索</span>
      </button>
    </div>
  </header>
</template>
