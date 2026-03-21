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
      },
      {
        path: 'space',
        // name: 'UserSpaceView',
        // component: () => import('@/views/user/UserSpaceView.vue'),
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
