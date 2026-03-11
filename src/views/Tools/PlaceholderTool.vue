<script setup>
defineProps({
  name: { type: String, required: true },
  desc: { type: String, default: '该功能需要服务端支持，敬请期待' },
})
</script>

<template>
  <div class="space-y-4 py-8 text-center">
    <p class="text-slate-600 dark:text-slate-400">{{ name }}</p>
    <p class="text-sm text-slate-500 dark:text-slate-500">{{ desc }}</p>
  </div>
</template>
