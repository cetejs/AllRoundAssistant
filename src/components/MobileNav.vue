<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { modules } from '../config/modules'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const { preference, setTheme } = useTheme()
const showMenu = ref(false)

const navItems = [
  { path: '/', name: '全部' },
  ...modules.map((m) => ({ path: m.path, name: m.name })),
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const themeOrder = ['light', 'dark', 'auto']
const themeIcons = { light: '☀', dark: '🌙', auto: '🔄' }
const cycleTheme = () => setTheme(themeOrder[(themeOrder.indexOf(preference.value) + 1) % themeOrder.length])
</script>

<template>
  <div class="md:hidden fixed top-0 left-0 right-0 z-50 h-12 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-4">
    <router-link to="/" class="font-mono-ui font-semibold text-slate-800 dark:text-slate-100">
      全能助手
    </router-link>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="p-2 rounded-lg text-slate-600 dark:text-slate-400"
        :title="preference === 'light' ? '浅色' : preference === 'dark' ? '深色' : '跟随系统'"
        @click="cycleTheme"
      >
        {{ themeIcons[preference] }}
      </button>
      <button
        type="button"
        class="p-2 rounded-lg text-slate-600 dark:text-slate-400"
        @click="showMenu = !showMenu"
      >
        ☰
      </button>
    </div>
    <div
      v-show="showMenu"
      class="absolute top-12 left-0 right-0 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
    >
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="block px-4 py-2 text-slate-600 dark:text-slate-400"
        :class="isActive(item.path) ? 'text-emerald-600 dark:text-emerald-400' : ''"
        @click="showMenu = false"
      >
        {{ item.name }}
      </router-link>
    </div>
  </div>
</template>
