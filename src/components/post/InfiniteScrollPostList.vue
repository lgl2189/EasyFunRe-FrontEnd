<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  columns: {
    type: Number,
    default: 5,
  },
  // 支持传入初始视频列表
  initialPostList: {
    type: Array,
    default: () => [],
  },
})

const emits = defineEmits(['load-post'])

const posts = ref([])
const loading = ref(false)
const loadTrigger = ref(null)
let observer = null
// 防止重复检查和无限加载
const isChecking = ref(false)

const addNewPost = (newPosts) => {
  if (newPosts && Array.isArray(newPosts)) {
    posts.value.push(...newPosts)
  }
  loading.value = false
  // 加载完成后检测是否需要继续加载
  nextTick(() => {
    checkIfNeedMoreLoad()
  })
}

const loadMore = () => {
  if (!loading.value) {
    loading.value = true
    emits('load-post')
  }
}

// 检查当前内容是否已撑满视口，如果没有出现窗口滚动条则继续加载
const checkIfNeedMoreLoad = () => {
  if (isChecking.value || loading.value) return
  isChecking.value = true

  // 使用窗口滚动高度判断当前内容是否已撑满视口
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  // 增加少量容差，避免边界抖动
  const hasEnoughContent = scrollHeight > clientHeight + 50

  // 只有内容不足以产生滚动条时才继续加载
  if (!hasEnoughContent) {
    loadMore()
  }

  isChecking.value = false
}

onMounted(() => {
  // 初始化时使用传入的初始数据
  if (props.initialPostList && props.initialPostList.length > 0) {
    posts.value = [...props.initialPostList]
  }

  loadMore()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    {
      rootMargin: '100px',
    },
  )

  if (loadTrigger.value) {
    observer.observe(loadTrigger.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

defineExpose({
  addNewPost,
})
</script>

<template>
  <div class="post-list">
    <div class="post-grid" :style="{ gridTemplateColumns: `repeat(${props.columns}, 1fr)` }">
      <div v-for="post in posts" :key="post.postId" class="video-card">
        <div class="cover">
          <img :src="post.coverUrl" alt="投稿封面" />
        </div>
        <div class="content">
          <h4 class="title">{{ post.title }}</h4>
          <div class="author">
            <span class="name">{{ post.authorName }}</span>
          </div>
          <div class="meta">
            <span>{{ post.viewCount }}观看</span>
            <span>{{ post.likeCount }}点赞</span>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="posts.length === 0 && !loading" description="暂无投稿" />

    <div v-if="loading" class="loading-indicator">
      <el-icon :size="20">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>

    <div ref="loadTrigger" class="load-trigger" />
  </div>
</template>

<style lang="less" scoped>
.post-list {
  width: 100%;

  .post-grid {
    display: grid;
    gap: 24px;
    padding-bottom: 20px;
  }

  .video-card {
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .cover {
      width: 100%;
      position: relative;

      img {
        width: 100%;
        display: block;
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }
    }

    .content {
      padding: 16px;

      .title {
        font-size: 16px;
        font-weight: 600;
        line-height: 1.4;
        margin: 0 0 12px 0;
        color: #1a1a1a;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .author {
        margin-bottom: 10px;

        .name {
          font-size: 14px;
          color: #666666;
        }
      }

      .meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        color: #999999;
      }
    }
  }

  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 30px 0 20px;
    color: #666666;
    font-size: 14px;
  }

  .load-trigger {
    width: 100%;
    height: 20px;
  }
}
</style>
