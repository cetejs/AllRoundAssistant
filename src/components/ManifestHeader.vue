<script setup>
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <header class="flex items-center justify-between gap-4 mb-6 px-6 pt-6">
    <div>
      <h1 class="font-mono-ui text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
        {{ title }}
      </h1>
    </div>
  </header>
</template>
