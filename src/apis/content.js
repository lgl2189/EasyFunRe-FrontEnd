import { UPLOAD_TIMEOUT } from '@/constant/header-constant'
import request from '@/utils/request'

/**
 * 上传视频投稿
 * @param {FormData} formdata 投稿表单
 * @returns {Promise}
 */
export const uploadVideoPost = (formdata, config = {}) => {
  return request.post('/content/post/video', formdata, {
    ...config,
    timeout: UPLOAD_TIMEOUT, // 超时时间两个小时
  })
}
/**
 * 获取投稿详情
 * @param {number} postId 投稿ID
 */
export const getPost = (postId) => {
  return request.get('/content/post/' + postId)
}

/**
 * 获取推荐的投稿列表
 */
export const getRecommendPostList = (pageSize = 10, alpha = 0.55, wDiv = 0.5, wBound = 0.1) => {
  return request.get(`/content/recommend/list?pageSize=${pageSize}&alpha=${alpha}&wDiv=${wDiv}&wBound=${wBound}`)
}
/**
 * 对投稿进行点赞或取消点赞
 * @param {String} postId 投稿ID
 * @param {Boolean} isLike 点赞/取消点赞，true为点赞，false为取消点赞
 * @returns
 */
export const userLikePost = (postId, isLike) => {
  return request.post(`/content/post/${postId}/like?isLike=${isLike}`)
}
/**
 * 对投稿进行点踩或取消点踩
 * @param {String} postId 投稿ID
 * @param {Boolean} isDislike 点踩/取消点踩，true为点踩，false为取消点踩
 * @returns
 */
export const userDislikePost = (postId, isDislike) => {
  return request.post(`/content/post/${postId}/dislike?isDislike=${isDislike}`)
}
/**
 * 获取用户的投稿列表
 * @param {Number} pageNum
 * @param {Number} pageSize
 * @param {Array} keywordList
 * @returns
 */
export const searchPostByKeyword = (pageNum, pageSize, keywordList) => {
  const keywordParams = keywordList.map((keyword) => `keyword=${encodeURIComponent(keyword)}`).join('&')
  const url = `/content/post/search?pageNum=${pageNum}&pageSize=${pageSize}&${keywordParams}`
  return request.get(url)
}
