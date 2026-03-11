<script setup>
import { RouterView } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import MobileNav from './components/MobileNav.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <AppSidebar />
    <MobileNav />
    <main class="pt-12 md:pt-0 md:pl-56 min-h-screen">
      <RouterView />
    </main>
  </div>
</template>
