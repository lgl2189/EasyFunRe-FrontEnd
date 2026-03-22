import { useUserStore } from '@/stores/user'
import { createRouter } from 'vue-router'
import { createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: () => import('@/views/HomeView.vue'),
    alias: ['/home'],
    children: [],
  },
  {
    path: '/user',
    children: [
      {
        path: 'center',
        name: 'UserCenterView',
        component: () => import('@/views/user/UserCenterView.vue'),
        meta: { requireLogin: true },
      },
      {
        path: 'space',
        // name: 'UserSpaceView',
        // component: () => import('@/views/user/UserSpaceView.vue'),
        meta: { requireLogin: true },
      },
      {
        path: 'login',
        name: 'UserLoginView',
        component: () => import('@/views/user/UserLoginView.vue'),
      },
    ],
  },
  {
    path: '/error',
    children: [
      {
        path: '404',
        name: 'Error404View',
        component: () => import('@/views/error/Error404View.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

router.beforeEach((to, from) => {
  if (to.meta.requireLogin && useUserStore().isLogin === false) {
    // 如果目标页面需要登录，并且未登录，则跳转到登录页面
    return { name: 'UserLoginView', query: { redirect: to.fullPath } }
  }
})
