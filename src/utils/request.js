import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { HEADER_AUTHORIZATION, HEADER_DEVICE_ID, HEADER_FINGERPRINT } from '@/constant/header-constant'
import router from '@/router'

// 创建Axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// 请求拦截器：添加认证token
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    config.headers[HEADER_DEVICE_ID] = userStore.deviceId
    config.headers[HEADER_FINGERPRINT] = userStore.fingerprint
    if (userStore.accessToken) {
      // 添加认证token，Bearer+空格+token，空格是必须的
      config.headers[HEADER_AUTHORIZATION] = `Bearer ${userStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：统一处理结果
request.interceptors.response.use(
  (response) => {
    if (response.data.status >= 30000 && response.data.status < 40000) {
      ElMessage.error('未登录，请先登录！')
      router().push({ name: 'UserLoginView' })
    }
    return response.data
  },
  (error) => {
    ElMessage.error('网络错误，请稍后再试！\n' + error.message)
    return Promise.reject(error)
  },
)

export default request
