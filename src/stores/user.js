import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    userId: null,
    isLogin: false,
  }),
  actions: {
    clearUserStore() {
      this.accessToken = null
      this.refreshToken = null
      this.userId = null
      this.isLogin = false
    },
  },
  persist: {
    key: 'easy-fun-user',
    storage: localStorage,
  },
})
