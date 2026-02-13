import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue'
import NewPassword from "../views/NewPassword.vue";
import PasswordAccounts from '../views/PasswordAccounts.vue';
import PasswordAccount from '../views/PasswordAccount.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'passwords',
      component: Home,
    },

    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
    {
      path: "/newpassword",
      name: "newpassword",
      component: NewPassword
    },
    {
      path: '/passwords/:website',
      name: 'password-accounts',
      component: PasswordAccounts
    },
    {
      path:'/passwords/:website/:accountId',
      name: 'password-account',
      component:PasswordAccount
    }
  ],
})

export default router
