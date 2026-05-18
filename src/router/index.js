import { useUserStore } from '@/stores/user'
import { createRouter } from 'vue-router'
import { createWebHistory } from 'vue-router'

const routes = [
  // 主功能路由
  {
    path: '/',
    // 别名只用于同级映射，不会生成子路径的路由
    alias: ['/home'],
    redirect: '',
    name: 'MainHomeView',
    component: () => import('@/views/main/MainHomeView.vue'),
    children: [
      {
        path: '/user',
        children: [
          {
            path: 'center',
            name: 'UserCenterView',
            component: () => import('@/views/main/user/UserCenterView.vue'),
            meta: { requireLogin: true },
          },
          {
            path: 'space',
            name: 'UserSpaceView',
            component: () => import('@/views/main/user/UserSpaceView.vue'),
            meta: { requireLogin: true },
          },
          {
            path: 'login',
            name: 'UserLoginView',
            component: () => import('@/views/main/user/UserLoginView.vue'),
          },
        ],
      },
      {
        path: '/post',
        children: [
          {
            path: 'video',
            children: [
              {
                path: 'watch/:postId',
                name: 'VideoWatchView',
                component: () => import('@/views/main/video/VideoWatchView.vue'),
              },
            ],
          },
          {
            path: 'recommend/config',
            name: 'RecommendConfigView',
            component: () => import('@/views/main/recommend/RecommendConfigView.vue'),
            meta: { requireLogin: true },
          },
          {
            path: 'tag',
            children: [
              {
                path: 'initial',
                name: 'InitialTagView',
                component: () => import('@/views/main/post/InitialTagView.vue'),
                meta: { requireLogin: true },
              },
            ],
          },
        ],
      },
    ],
  },
  // 创作中心路由
  {
    path: '/creation',
    alias: ['/creation/home'],
    name: 'CreationCenterView',
    component: () => import('@/views/creation/CreationCenterView.vue'),
    meta: { requireLogin: true },
    children: [
      {
        path: 'home',
      },
      {
        path: 'upload',
        name: 'CreationUploadView',
        component: () => import('@/views/creation/upload/CreationUploadView.vue'),
      },
    ],
  },
  // 错误页面路由
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
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundView',
    component: () => import('@/views/error/Error404View.vue'),
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
