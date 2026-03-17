/**
 * @description Socket连接类型枚举
 * @enum {string} SOCKET_TYPE
 * @property {string} USER 用户个人订阅
 */
export const SOCKET_TYPE = {
  USER: 'user',
}

export const SOCKET_SUBSCRIBE_PATH = {
  USER: (userId) => {
    return `/user/${userId}/chat`
  },
}
