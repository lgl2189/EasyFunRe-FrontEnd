<script setup>
import { onUnmounted, ref, watch } from 'vue'
import CommentArea from '@/components/comment/CommentArea.vue'
import { onMounted } from 'vue'
import VideoPlayer from '@/components/post/video/VideoPlayer.vue'
import { useRoute, useRouter } from 'vue-router'
import ViewCountIcon from '@/assets/icons/svg/content/view-count-icon.svg'
import BulletCommentIcon from '@/assets/icons/svg/content/bullet-comment-icon.svg'
import LikeIcon from '@/assets/icons/svg/content/like-icon.svg'
import DislikeIcon from '@/assets/icons/svg/content/dislike-icon.svg'
import CollectionIcon from '@/assets/icons/svg/content/collection-icon.svg'
import ReportIcon from '@/assets/icons/svg/content/report-icon.svg'
import { getPost, userDislikePost, userLikePost } from '@/apis/content'
import { RESPONSE_ERROR_20000, RESPONSE_SUCCESS } from '@/constant/response-constant'
import { cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus'

// 获取路由实例
const route = useRoute()
const router = useRouter()
// 响应式对象存储postId
const postParamSet = ref({
  postId: route.params.postId,
  ownerId: '',
  title: '测试稿件1',
  description: '测试稿件1简介',
  coverUrl: '',
  postType: 2,
  isVisibility: 1,
  allowComment: 1,
  status: 1,
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  commentAreaId: 0,
  createdAt: '2026-04-11T18:27:55',
  publishedAt: null,
  updatedDatetime: '2026-04-11T18:27:55',
  isLike: false,
  isDislike: false,
  isCollecte: false,
  resourceList: [],
})

// 视频标题栏数据
// const postTitle = ref('为什么2026年了苹果还敢出8G内存的电脑？')
// const viewCount = ref('52.2万')
// const commentCount = ref('663')
// const publishTime = ref('2026-03-23 11:34:23')
// const forbiddenText = ref('未经作者授权，禁止转载')

const commentList = ref([])
const hasMore = ref(true)
const loading = ref(true)

// 函数
// 加载投稿信息
const handleGetPost = async () => {
  loading.value = true
  const res = await getPost(postParamSet.value.postId)
  if (res.status === RESPONSE_SUCCESS) {
    postParamSet.value = cloneDeep(res.data)
  } else {
    if (res.status === RESPONSE_ERROR_20000) {
      router.push({ name: 'Error404View' })
    }
  }
}
// 从后端获取初始评论列表 - 占位符函数
const fetchCommentList = async () => {
  try {
    loading.value = true
    // 请在这里编写请求后端获取初始评论列表的逻辑
    // 示例：const res = await api.getCommentList()
    // commentList.value = res.data.list
    // hasMore.value = res.data.hasMore
  } catch (error) {
    console.error('获取评论列表失败：', error)
  } finally {
    loading.value = false
  }
}
// 投稿功能区
const handleUserLikePost = async () => {
  const res = await userLikePost(postParamSet.value.postId, !postParamSet.value.isLike)
  if (res.status === RESPONSE_SUCCESS) {
    if (postParamSet.value.isLike) {
      // 取消点赞
      postParamSet.value.isLike = false
      postParamSet.value.likeCount--
    } else {
      // 点赞
      postParamSet.value.isLike = true
      postParamSet.value.likeCount++
    }
    postParamSet.value.isDislike = false
  } else {
    ElMessage.error('点赞或取消点赞失败，请稍后再试')
  }
}
const handleUserDisLikePost = async () => {
  const res = await userDislikePost(postParamSet.value.postId, !postParamSet.value.isDislike)
  if (res.status === RESPONSE_SUCCESS) {
    postParamSet.value.isDislike = !postParamSet.value.isDislike
    if (postParamSet.value.isLike) {
      // 取消点赞
      postParamSet.value.isLike = false
      postParamSet.value.likeCount--
    }
  } else {
    ElMessage.error('点踩或取消点踩失败，请稍后再试')
  }
}
const handleCollectPost = () => {}
// 从后端加载更多评论 - 占位符函数
const fetchMoreComments = async () => {
  try {
    loading.value = true
    // 请在这里编写请求后端加载更多评论的逻辑
    // 示例：const res = await api.getMoreComments({ page: xxx })
    // commentList.value = [...commentList.value, ...res.data.list]
    // hasMore.value = res.data.hasMore
  } catch (error) {
    console.error('加载更多评论失败：', error)
  } finally {
    loading.value = false
  }
}

// 检测滚动并调用组件的开始加载函数
const handleWindowScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  if (scrollTop + clientHeight >= scrollHeight - 50) {
    startLoadMore()
  }
}

const startLoadMore = () => {
  if (loading.value || !hasMore.value) return
  fetchMoreComments()
}

const handleGoTOPrevVideo = () => {
  // 请在这里编写请求后端/处理上一个视频的逻辑
}
const handleGoTONextVideo = () => {
  // 请在这里编写请求后端/处理下一个视频的逻辑
}
// 监听器
// 监听路由参数变化，更新postId
watch(
  () => route.params.postId,
  (newPostId) => {
    postParamSet.value.postId = newPostId
  },
  { immediate: true },
)
// 生命周期
// 初始加载评论数据
onMounted(() => {
  handleGetPost()
  fetchCommentList()
})
onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleWindowScroll)
})
</script>

<template>
  <div class="post-container">
    <div class="post-left">
      <div class="post-header">
        <div class="post-header-main">
          {{ postParamSet.title }}
        </div>
        <div class="post-header-sub">
          <div class="view-count">
            <ViewCountIcon class="view-icon" />
            {{ postParamSet.viewCount }}
          </div>
          <div class="comment-count">
            <BulletCommentIcon class="bullet-comment-icon" />
            {{ postParamSet.commentCount }}
          </div>
          <div class="publish-time">{{ postParamSet.createdAt }}</div>
          <!-- <div class="forbidden-notice">🚫 {{ forbiddenText }}</div> -->
        </div>
      </div>
      <!-- 视频播放器 -->
      <div class="video-player-container">
        <div class="video-player-wrapper">
          <VideoPlayer
            window-width="700px"
            window-height="400px"
            :video-src="postParamSet?.resourceList[0]?.fileUrl"
            @prev-video="handleGoTOPrevVideo"
            @next-video="handleGoTONextVideo" />

          <div class="video-player-error" v-if="!postParamSet?.resourceList?.[0]?.fileUrl">
            <span>视频暂时无法播放</span>
          </div>
        </div>
      </div>
      <!-- 投稿功能区 -->
      <div class="post-function-container">
        <div class="function-item" :class="{ 'function-item-clicked': postParamSet.isLike }" @click="handleUserLikePost">
          <LikeIcon class="function-icon" />
          <span class="function-count">{{ postParamSet.likeCount }}</span>
        </div>
        <div class="function-item" :class="{ 'function-item-clicked': postParamSet.isDislike }" @click="handleUserDisLikePost">
          <DislikeIcon class="function-icon" />
          <span class="function-count">6.4万</span>
        </div>
        <!-- <div class="function-item">
          <CoinIcon class="function-icon" />
          <span class="function-count">4240</span>
        </div> -->
        <div class="function-item" :class="{ 'function-item-clicked': postParamSet.isCollecte }" @click="handleCollectPost">
          <CollectionIcon class="function-icon" />
          <span class="function-count">1.6万</span>
        </div>
        <!-- <div class="function-item">
          <ShareIcon class="function-icon" />
          <span class="function-count">1423</span>
        </div> -->
        <div class="function-item">
          <ReportIcon class="function-icon" />
          <span class="function-text">稿件举报</span>
        </div>
      </div>
      <!-- 评论区 -->
      <div class="post-comment-container">
        <CommentArea width="700px" :commentList="commentList" :hasMore="hasMore" :loading="loading" />
      </div>
    </div>
    <div class="post-right"></div>
  </div>
</template>

<style lang="less" scoped>
.post-container {
  height: 100%;
  width: 100%;
  .post-left {
    box-sizing: border-box;
    width: 800px;
    padding: 0 20px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: start;
    .post-header {
      margin: 20px 0 20px;
      .post-header-main {
        font-size: 20px;
        font-weight: 500;
        color: #222222;
        line-height: 1.4;
        margin-bottom: 10px;
      }
      .post-header-sub {
        display: flex;
        align-items: center;
        gap: 20px;
        font-size: 14px;
        color: #666666;
        .view-count,
        .comment-count {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .view-icon,
        .bullet-comment-icon {
          width: 18px;
          height: 18px;
          color: inherit;
        }
        .forbidden-notice {
          color: #ff4d4f;
          margin-left: auto;
        }
      }
    }
    .video-player-container {
      .video-player-wrapper {
        position: relative;
        width: 700px;
        height: 430px;
        .video-player-error {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
    .post-function-container {
      display: flex;
      align-items: center;
      gap: 40px;
      padding: 20px 0;

      .function-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #666666;
        cursor: pointer;

        .function-icon {
          width: 24px;
          height: 24px;
          color: inherit;
        }

        .function-count,
        .function-text {
          color: inherit;
        }
        &:hover {
          transition: all 0.2s;
          color: #00aeec;
        }
      }
      .function-item-clicked {
        color: #00aeec;
      }
    }
    .post-comment-container {
      width: 100%;
    }
  }
  .post-right {
  }
}
</style>
