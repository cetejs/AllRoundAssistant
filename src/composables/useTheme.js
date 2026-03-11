import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const STORAGE_KEY = 'allround-theme'

const preference = ref('auto')
const systemDark = ref(false)

const mediaQuery = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

const updateSystemDark = () => {
  if (mediaQuery) systemDark.value = mediaQuery.matches
}

const effectiveTheme = computed(() => {
  if (preference.value === 'light') return 'light'
  if (preference.value === 'dark') return 'dark'
  return systemDark.value ? 'dark' : 'light'
})

const isDark = computed(() => effectiveTheme.value === 'dark')

const applyTheme = () => {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  if (isDark.value) {
    el.classList.add('dark')
  } else {
    el.classList.remove('dark')
  }
}

export function useTheme() {
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      preference.value = saved
    }
    updateSystemDark()
    applyTheme()
    if (mediaQuery) {
      mediaQuery.addEventListener('change', updateSystemDark)
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', updateSystemDark)
    }
  })

  watch(isDark, applyTheme)

  const setTheme = (value) => {
    preference.value = value
    localStorage.setItem(STORAGE_KEY, value)
  }

  return {
    preference,
    effectiveTheme,
    isDark,
    setTheme,
  }
}
