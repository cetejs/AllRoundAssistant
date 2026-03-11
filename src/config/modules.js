/**
 * 模块注册配置 - 新增分类时在此添加
 */
export const modules = [
  {
    id: 'daily',
    name: '日报',
    path: '/daily',
    icon: '📋',
    ref: 'REF: DLY-001',
    type: 'DAILY',
    description: '每日记录与回顾',
  },
  {
    id: 'learning',
    name: '学习',
    path: '/learning',
    icon: '📚',
    ref: 'REF: LRN-002',
    type: 'LEARNING',
    description: '学习笔记与资源',
  },
  {
    id: 'tools',
    name: '工具',
    path: '/tools',
    icon: '🔧',
    ref: 'REF: TOL-003',
    type: 'TOOLS',
    description: '常用小工具集合',
  },
]
