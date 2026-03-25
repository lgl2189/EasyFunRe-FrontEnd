import { loginByToken, refreshAccessToken } from '@/apis/user'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'
// useRouter和useRoute依赖的inject函数只能在vue文件的setup函数中调用，不能在其他地方调用
// 因此，这里使用直接导入router对象代替，但是router对象不能响应式更新，也就是无法获取路由实时变化
// router使用在跳转场景没有问题
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

/**
 *
 * @param {*} res 从后端收到的响应体（包含accessToken，refreshToken，userId，newDevice, deviceId）
 */
export const processInitialLogin = (res) => {
  const userStore = useUserStore()
  const { accessToken, refreshToken, userId, newDevice, deviceId } = res.data
  if (newDevice == true) {
    userStore.deviceId = deviceId
  }
  userStore.accessToken = accessToken
  userStore.refreshToken = refreshToken
  userStore.userId = userId
  userStore.isLogin = true
  startTokenRefreshTimer()
}

export const processRefreshToken = async () => {
  const res = await refreshAccessToken()
  if (res.status !== RESPONSE_SUCCESS) {
    console.error('刷新accessToken失败，请重新登录')
    ElMessage.error('刷新accessToken失败，请重新登录')
    router.push({ name: 'UserLoginView' })
    return Promise.reject()
  }
  const userStore = useUserStore()
  const { accessToken, refreshToken, userId } = res.data
  userStore.accessToken = accessToken
  userStore.refreshToken = refreshToken
  userStore.userId = userId
}

/**
 * 退出登录，清除用户信息，刷新页面
 */
export const processLogout = () => {
  const userStore = useUserStore()
  userStore.clearUserStore()
  // 强制从服务器重新加载 (绕过缓存)
  window.location.reload(true)
  stopTokenRefreshTimer()
}

/**
 * 获取token过期时间
 */
export const getAccessTokenExpireAt = () => {
  const userStore = useUserStore()
  const accessToken = userStore.accessToken
  if (!accessToken) {
    console.error('accessToken不存在，计算过期时间失败')
    return null
  }
  // JWT 结构: Header.Payload.Signature
  // 我们只需要中间的 Payload 部分
  const base64Url = accessToken.split('.')[1]

  // 将 Base64URL 转换为标准 Base64
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  // 解码 Base64 字符串为 JSON 对象
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )
  const payload = JSON.parse(jsonPayload)
  const expireAt = payload.exp * 1000 // 过期时间戳（秒）
  return expireAt
}

// Token刷新计时器
export const REFRESH_BEFORE_EXPIRE = 5 * 60 * 1000 // 提前 5 分钟刷新
let refreshTimer = null
/**
 * 启动定时器，定时刷新token
 */
export const startTokenRefreshTimer = async () => {
  // 清除旧定时器
  if (refreshTimer) clearTimeout(refreshTimer)
  // 启动新定时器
  const now = Date.now()
  const expireAt = getAccessTokenExpireAt()
  const delay = expireAt - now - REFRESH_BEFORE_EXPIRE
  if (delay <= 0) {
    console.warn('accessToken即将过期，立刻刷新')
    await processRefreshToken()
  }
  refreshTimer = setTimeout(async () => {
    await processRefreshToken()
    await startTokenRefreshTimer()
  }, delay)
  // console.log(`启动AccessToken定时刷新，${delay / 1000} 秒后刷新`)
}

/**
 * 停止定时器 (通常用于登出时)
 */
export function stopTokenRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}
/**
 * 初始用户登陆状态
 * @returns 初始登陆状态是否成功
 */
export const initUserLoginStatus = async () => {
  // 初始化用户登录状态
  const userStore = useUserStore()
  // 判断AccessToken是否临近过期或已过期
  const expireDuration = getAccessTokenExpireAt() - Date.now() - REFRESH_BEFORE_EXPIRE
  if (expireDuration > 0) {
    // AccessToken未过期，直接获取用户信息
    const res = await loginByToken()
    if (res.status !== RESPONSE_SUCCESS) {
      processLogout()
      return Promise.reject(res.message)
    }
    const { userId } = res.data
    userStore.userId = userId
    userStore.isLogin = true
  } else {
    // AccessToken已过期，刷新AccessToken
    await processRefreshToken()
    userStore.isLogin = true
  }
  await startTokenRefreshTimer()
}
