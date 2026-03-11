<script setup>
import { RouterView } from 'vue-router'
import AppNav from './components/AppNav.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <AppNav />
    <main class="container mx-auto px-4 py-6 max-w-6xl">
      <RouterView />
    </main>
  </div>
</template>
