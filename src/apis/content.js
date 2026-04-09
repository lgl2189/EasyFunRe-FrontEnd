import { UPLOAD_TIMEOUT } from '@/constant/header-constant'
import request from '@/utils/request'

/**
 * 上传视频投稿
 * @param {FormData} formdata 投稿表单
 * @returns {Promise}
 */
export const uploadVideoPost = (formdata, config = {}) => {
  return request.post('/content/upload/post/video', formdata, {
    ...config,
    timeout: UPLOAD_TIMEOUT, // 超时时间两个小时
  })
}
