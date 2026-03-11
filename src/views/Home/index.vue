<script setup>
import { modules } from '../../config/modules'
</script>

<template>
  <div>
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        全能助手
      </h1>
      <p class="text-slate-600 dark:text-slate-400 text-lg">
        日报 · 学习 · 全能助手，一站式助手
      </p>
    </header>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
      <router-link
        v-for="m in modules"
        :key="m.id"
        :to="m.path"
        class="group block p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
      >
        <span class="text-4xl mb-3 block">{{ m.icon }}</span>
        <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {{ m.name }}
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm">
          {{ m.description }}
        </p>
      </router-link>
    </div>
  </div>
</template>
