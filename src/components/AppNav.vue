<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { modules } from '../config/modules'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const { preference, setTheme } = useTheme()
const showThemeMenu = ref(false)

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const themeLabels = {
  light: '浅色',
  dark: '深色',
  auto: '跟随系统',
}

const closeOnClickOutside = (e) => {
  if (!e.target.closest('.theme-toggle')) showThemeMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside)
  return () => document.removeEventListener('click', closeOnClickOutside)
})
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="flex items-center justify-between h-12">
        <router-link
          to="/"
          class="text-lg font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          全能助手
        </router-link>
        <div class="flex items-center gap-2">
          <router-link
            v-for="m in modules"
            :key="m.id"
            :to="m.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(m.path)
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'"
          >
            <span class="mr-1.5">{{ m.icon }}</span>
            {{ m.name }}
          </router-link>
          <div class="relative theme-toggle ml-2">
            <button
              type="button"
              class="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              title="主题切换"
              @click="showThemeMenu = !showThemeMenu"
            >
              <span class="text-lg">🌓</span>
            </button>
            <div
              v-show="showThemeMenu"
              class="absolute right-0 top-full mt-1 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg min-w-[100px]"
            >
              <button
                v-for="opt in ['light', 'dark', 'auto']"
                :key="opt"
                type="button"
                class="w-full px-4 py-2 text-left text-sm transition-colors"
                :class="preference === opt
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'"
                @click="setTheme(opt); showThemeMenu = false"
              >
                {{ themeLabels[opt] }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
