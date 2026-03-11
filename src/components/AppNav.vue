<script setup>
import { useRoute } from 'vue-router'
import { modules } from '../config/modules'

const route = useRoute()

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <router-link
          to="/"
          class="text-xl font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          全能助手
        </router-link>
        <div class="flex gap-1">
          <router-link
            v-for="m in modules"
            :key="m.id"
            :to="m.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(m.path)
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'"
          >
            <span class="mr-1.5">{{ m.icon }}</span>
            {{ m.name }}
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
