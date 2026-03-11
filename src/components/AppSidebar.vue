<script setup>
import { useRoute } from 'vue-router'
import { modules } from '../config/modules'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const { preference, setTheme } = useTheme()

const navItems = [
  { id: 'all', path: '/', name: '全部', icon: '▦' },
  ...modules.map((m) => ({
    id: m.id,
    path: m.path,
    name: m.name,
    icon: m.icon,
  })),
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const themeOrder = ['light', 'dark', 'auto']
const themeIcons = { light: '☀', dark: '🌙', auto: '🔄' }
const themeLabels = { light: '浅色', dark: '深色', auto: '跟随系统' }

const cycleTheme = () => {
  const idx = themeOrder.indexOf(preference.value)
  const next = themeOrder[(idx + 1) % themeOrder.length]
  setTheme(next)
}
</script>

<template>
  <aside class="fixed left-0 top-0 z-40 h-screen w-56 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col max-md:w-0 max-md:overflow-hidden">
    <div class="p-4 border-b border-slate-200 dark:border-slate-700">
      <h1 class="font-mono-ui text-lg font-bold text-slate-800 dark:text-slate-100">
        全能助手
      </h1>
    </div>
    <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.id"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-mono-ui text-sm"
        :class="isActive(item.path)
          ? 'bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <span class="text-base">{{ item.icon }}</span>
        <div class="flex-1 min-w-0">{{ item.name }}</div>
      </router-link>
    </nav>
    <div class="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
      <button
        type="button"
        class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
        :title="themeLabels[preference]"
        @click="cycleTheme"
      >
        <span class="text-base">{{ themeIcons[preference] }}</span>
        <span>主题</span>
      </button>
      <a
        href="https://github.com/cetejs/AllRoundAssistant"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
      >
        <span>ℹ</span>
        <span>关于</span>
      </a>
    </div>
  </aside>
</template>
