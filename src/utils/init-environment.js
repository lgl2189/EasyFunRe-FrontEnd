import { useUserStore } from '@/stores/user'
import { generateFingerprint } from './auth'
import { initUserLoginStatus } from './user'

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
  await initUserLoginStatus()
  return Promise.resolve()
}
