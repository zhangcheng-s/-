import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/login/register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/login/forgetPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/login' // 根路径重定向到登录页
  },
  {
    path: '/main',
    component: () => import('@/views/layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'Home' }
      },
      {
        path: 'home',
        alias: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue')
      },
      {
        path: 'management',
        alias: '/management',
        name: 'Management',
        component: () => import('@/views/management/index.vue')
      },
      {
        path: 'voyagesearch',
        alias: '/voyagesearch',
        name: 'VoyageSearch',
        component: () => import('@/views/voyagesearch/index.vue')
      },
      {
        path: 'voyagesearch/:id',
        name: 'VoyageDetail',
        component: () => import('@/views/voyagesearch/detail.vue')
      },
      {
        path: 'chemsearch',
        alias: '/chemsearch',
        name: 'ChemSearch',
        component: () => import('@/views/chemsearch/index.vue')
      },
      {
        path: 'chemsearch/:id',
        name: 'ChemDetail',
        component: () => import('@/views/chemsearch/detail.vue')
      },
      {
        path: 'biosearch',
        alias: '/biosearch',
        name: 'BioSearch',
        component: () => import('@/views/biosearch/index.vue')
      },
      {
        path: 'biosearch/:id',
        name: 'BioDetail',
        component: () => import('@/views/biosearch/detail.vue')
      },
      {
        path: 'analysis',
        alias: '/analysis',
        name: 'Analysis',
        component: () => import('@/views/analysis/index.vue')
      },
      {
        path: 'export',
        alias: '/export',
        name: 'Export',
        component: () => import('@/views/export/index.vue')
      },
      {
        path: 'about',
        alias: '/about',
        name: 'About',
        component: () => import('@/views/about/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 恢复路由守卫
router.beforeEach((to, from, next) => {
  // 检查 sessionStorage 中是否有登录用户信息
  const isLoggedIn = !!sessionStorage.getItem('loggedInUser')
  // 检查目标路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 如果路由需要认证但用户未登录，则跳转到登录页
  if (requiresAuth && !isLoggedIn) {
    next('/login')
  }
  // 如果用户已登录但试图访问登录页，则跳转到主页
  else if (to.path === '/login' && isLoggedIn) {
    next({ name: 'Home' })
  }
  // 其他情况正常放行
  else {
    next()
  }
})

export default router
