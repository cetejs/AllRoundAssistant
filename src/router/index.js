import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home/index.vue'),
    meta: { title: '' },
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('../views/Documents/index.vue'),
    meta: { title: '文档' },
  },
  {
    path: '/learning',
    name: 'Learning',
    component: () => import('../views/Learning/index.vue'),
    meta: { title: '学习' },
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('../views/Tools/index.vue'),
    meta: { title: '工具' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 全能助手` : '全能助手'
  next()
})

export default router
