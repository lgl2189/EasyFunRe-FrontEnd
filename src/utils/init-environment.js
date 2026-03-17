import { useUserStore } from '@/stores/user'
import { generateFingerprint } from './auth'
import { loginByToken } from '@/apis/user'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'
import { ElMessage } from 'element-plus'
import { getAccessTokenExpireAt, processLogout, startTokenRefreshTimer } from './user'

export const initUserEnvironment = async () => {
  const userStore = useUserStore()
  // 初始化环境指纹fingerprint，用于防止同设备短时间内多次发送请求，不用于标识设备
  // 设备Id，DeviceId 用于标识设备
  const fingerprint = generateFingerprint()
  userStore.fingerprint = fingerprint
  if (!userStore.deviceId || !userStore.accessToken || !userStore.refreshToken) {
    return Promise.resolve()
  }
  // 初始化用户登录状态
  const res = await loginByToken()
  if (!res.status === RESPONSE_SUCCESS) {
    ElMessage.error('自动登陆失败，请重新登录' + res.message)
    processLogout()
    return Promise.reject(res.message)
  }
  const { userId } = res.data
  userStore.userId = userId
  userStore.isLogin = true
  startTokenRefreshTimer()
  return Promise.resolve()
}
