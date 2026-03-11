<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { modules } from '../config/modules'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const { preference, setTheme } = useTheme()
const showSettings = ref(false)

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

const themeLabels = { light: '浅色', dark: '深色', auto: '跟随系统' }
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
    <div class="p-3 border-t border-slate-200 dark:border-slate-700 relative">
      <button
        type="button"
        class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
        @click="showSettings = !showSettings"
      >
        <span>⚙</span>
        <span>设置</span>
      </button>
      <div
        v-show="showSettings"
        class="absolute bottom-full left-3 right-3 mb-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg min-w-[140px]"
      >
        <div class="px-3 py-1.5 border-b border-slate-200 dark:border-slate-600">
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">主题</p>
          <div class="mt-1 space-y-0.5">
            <button
              v-for="opt in ['light', 'dark', 'auto']"
              :key="opt"
              type="button"
              class="w-full px-2 py-1 text-left text-sm rounded"
              :class="preference === opt
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
              @click="setTheme(opt)"
            >
              {{ themeLabels[opt] }}
            </button>
          </div>
        </div>
        <a
          href="https://github.com/cetejs/AllRoundAssistant"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          @click="showSettings = false"
        >
          <span>ℹ</span>
          <span>关于</span>
        </a>
      </div>
    </div>
  </aside>
</template>
