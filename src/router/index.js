import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { PHASE_ROUTES, landingPath } from '../nav.js'
import LoginPage from '../components/LoginPage.vue'
import HomePage from '../views/HomePage.vue'

let installedRole = null

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: { public: true, title: '登录' }
    },
    {
      path: '/home',
      name: 'Home',
      component: HomePage,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'HomeIndex', redirect: () => landingPath() }
      ]
    }
  ]
})

export function syncRoutes(role) {
  PHASE_ROUTES.forEach((route) => {
    const allow = route.meta.roles.includes(role)
    const exists = router.hasRoute(route.name)
    if (allow && !exists) router.addRoute('Home', { ...route })
    if (!allow && exists) router.removeRoute(route.name)
  })
  if (!router.hasRoute('HomeDenied')) {
    router.addRoute('Home', {
      path: ':pathMatch(.*)*',
      name: 'HomeDenied',
      component: () => import('../views/DeniedPage.vue'),
      meta: { title: '无法访问', pcOnly: false }
    })
  }
}

export function resetRouteInstall() {
  installedRole = null
}

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.path === '/') {
    next(auth.isAuthed ? landingPath() : '/login')
    return
  }
  if (to.meta.public || to.path === '/login') {
    if (auth.isAuthed) next(landingPath())
    else next()
    return
  }
  const needsAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (needsAuth && !auth.isAuthed) {
    next('/login')
    return
  }
  if (auth.user && installedRole !== auth.user.role) {
    syncRoutes(auth.user.role)
    installedRole = auth.user.role
    next({ path: to.path, query: to.query, hash: to.hash, replace: true })
    return
  }
  if (to.name === 'Home' || to.name === 'HomeIndex') {
    next(landingPath())
    return
  }
  if (to.meta.roles && auth.user && !to.meta.roles.includes(auth.user.role)) {
    next(landingPath())
    return
  }
  next()
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} · 校园OA` : '校园OA'
})

export default router
