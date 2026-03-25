import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue'
import NewPassword from '../views/NewPassword.vue'
import PasswordAccounts from '../views/PasswordAccounts.vue'
import PasswordAccount from '../views/PasswordAccount.vue'
import Admin from '../views/Admin.vue'
import Login from '../views/Login.vue'
import { isAuthenticated } from '../composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'passwords',
      component: Home,
      meta: { requiresAuth: true },
    },

    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: { requiresAuth: true },
    },
    {
      path: '/newpassword',
      name: 'newpassword',
      component: NewPassword,
      meta: { requiresAuth: true },
    },
    {
      path: '/passwords',
      name: 'password-accounts',
      component: PasswordAccounts,
      meta: { requiresAuth: true },
    },
    {
      path: '/passwords/:accountId',
      name: 'password-account',
      component: PasswordAccount,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.path === '/login' && isAuthenticated()) {
    return '/'
  }

  return true
})

export default router
