import request from '@/utils/request'
import { HEADER_REFRESH_TOKEN } from '@/constant/header-constant'
import { useUserStore } from '@/stores/user'

/**
 * 获取手机号登录验证码
 * @param {String} phone 需要获取验证码的手机号码
 */
export const getLoginSms = (phone) => {
  return request.get('/auth/login/sms', {
    params: { phone },
  })
}

/**
 * 使用Sms验证码进行登录
 * @param {String} phone 登录手机号码
 * @param {String} smsCode 使用该手机号获取的验证码
 */
export const loginBySms = (phone, smsCode) => {
  return request.post('/auth/login/sms', { phone, smsCode })
}

/**
 * 使用AccessToken登录
 * @returns {Promise} 响应体的data字段包含：{userId: string}
 */
export const loginByToken = () => {
  // 由请求拦截器设置了Authorization头部，无需在此处设置
  return request.post('/auth/login/token')
}

/**
 * 刷新AccessToken
 * @returns {Promise} 响应体的data字段包含：{accessToken: string, refreshToken: string}
 */
export const refreshAccessToken = () => {
  if (!useUserStore().refreshToken) {
    console.error('刷新AccessToken时，未从Pinia中获取到RefreshToken')
    return
  }
  return request.post(
    '/auth/refresh/token',
    {},
    {
      headers: {
        [HEADER_REFRESH_TOKEN]: useUserStore().refreshToken,
      },
    },
  )
}

/**
 * 退出用户登录
 */
export const logoutUser = () => {
  return request.post(
    '/auth/logout',
    {},
    {
      headers: {
        [HEADER_REFRESH_TOKEN]: useUserStore().refreshToken,
      },
    },
  )
}

export const getRSAPublicKey = () => {
  return request.get('/auth/rsa/public')
}
/**
 * 获取用户所有信息
 * @returns
 */
export const getUserInfoAll = () => {
  return request.get('/user/account/info-all')
}
/**
 * 获取用户公开信息
 * @returns
 */
export const getUserInfoPublic = () => {
  return request.get('/user/account/info-public')
}
/**
 * 更新用户信息
 * @param {Object} userInfo 必须包含这些属性，属性为空则必须设置为null
 * @property {userId,username,avatarUrl,gender,birthday,introduction}
 * @returns
 */
export const updateUserInfoAll = (userInfo) => {
  const { userId, username, avatarUrl, gender, birthday, introduction } = userInfo

  return request.put('/user/account/info-all', { userId, username, avatarUrl, gender, birthday, introduction })
}
/**
 * 更新用户密码
 * @param {Object} passwordInfo 必须包含这些属性，旧密码为空则必须设置为null，其余不能为空
 * @property {userId,oldPassword, newPassword}
 * @returns
 */
export const updateUserPassword = (passwordInfo) => {
  const { userId, oldPassword, newPassword } = passwordInfo
  return request.put('/user/account/password', {
    userId,
    oldPassword,
    newPassword,
  })
}
