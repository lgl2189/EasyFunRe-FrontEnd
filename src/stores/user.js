import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    userId: null,
    isLogin: false,
    deviceId: null,
    fingerprint: null,
    userInfo: {
      // 暂时未使用，后端未返回
      username: null,
    },
  }),
  actions: {
    clearUserStore() {
      this.accessToken = null
      this.refreshToken = null
      this.userId = null
      this.isLogin = false
      this.deviceId = null
      this.fingerprint = null
    },
  },
  persist: {
    // 注意，这里标记了不缓存是有效的。但是项目启动时在初始化流程中，会请求后端获取这两项，所以在页面加载完成时这两项是存在的。
    // 满足设计目的，不是这个配置无效导致的
    key: 'easy-fun-user',
    storage: localStorage,
    omit: ['fingerprint', 'isLogin'],
  },
})
