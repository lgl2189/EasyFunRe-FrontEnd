<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  columns: { type: Number, default: 5 },
  initialPostList: { type: Array, default: () => [] },
  minInterval: { type: Number, default: 500 },
})

const emits = defineEmits(['load-post'])
const postList = ref([])
const loading = ref(false)
const loadTrigger = ref(null)
let observer = null

const noMore = ref(false)
const consecutiveEmpty = ref(0)
const lastLoadTime = ref(0)
const pendingLoad = ref(false)
let intervalTimer = null

// 函数
const checkIfNeedMoreLoad = () => {
  if (loading.value || noMore.value) {
    return false
  }

  // 优先通过 loadTrigger 的位置判断是否在视口内或接近视口
  if (loadTrigger.value) {
    const rect = loadTrigger.value.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight

    // 如果触发器距离视口底部小于等于 300px（与 IntersectionObserver 的 rootMargin 保持一致）
    // rect.bottom > 0 用于排除 display:none 或完全不可见的情况
    if (rect.bottom > 0 && rect.top <= windowHeight + 300) {
      loadMore(false)
      return true
    }
  }

  // 备用：使用 document 高度判断内容是否已撑满视口
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  // 如果内容高度明显小于视口高度（留50px容差），则需要继续加载
  if (scrollHeight < clientHeight + 50) {
    loadMore(false)
    return true
  }
  return false
}

// 监听窗口大小变化（如缩放、调整窗口），以防内容在缩放后未撑满屏幕且未触发 IntersectionObserver
const handleResize = () => {
  if (!loading.value && !noMore.value) {
    checkIfNeedMoreLoad()
  }
}

const addNewPostList = (newPosts) => {
  loading.value = false

  if (newPosts && Array.isArray(newPosts) && newPosts.length > 0) {
    postList.value.push(...newPosts)
    consecutiveEmpty.value = 0
  } else {
    consecutiveEmpty.value++
    // 保险机制：如果连续5次加载都没有新内容，认定为异常或已加载完毕
    if (consecutiveEmpty.value >= 5) {
      noMore.value = true
    }
  }

  nextTick(() => {
    // 加载完成后检查是否需要继续加载（解决初始内容不足问题）
    if (!noMore.value) {
      // 第一次检查
      const needMore = checkIfNeedMoreLoad()

      // 如果还是不够，延迟再检查一次（防止DOM渲染未完成）
      if (!needMore) {
        setTimeout(() => {
          checkIfNeedMoreLoad()
        }, 100)
      }
    }
  })
}

const loadMore = (isTrigger = false) => {
  if (loading.value || noMore.value) {
    return
  }

  const now = Date.now()
  const elapsed = now - lastLoadTime.value

  // 如果是触发器触发，检查最小时间间隔
  if (isTrigger) {
    if (elapsed < props.minInterval) {
      // 如果已经在等待缓存的加载，则不再重复缓存
      if (!pendingLoad.value) {
        pendingLoad.value = true
        const remaining = props.minInterval - elapsed
        clearTimeout(intervalTimer)
        intervalTimer = setTimeout(() => {
          pendingLoad.value = false
          loadMore(true)
        }, remaining)
      }
      return
    }
  }

  // 执行实际加载前，清除任何待处理的缓存加载和定时器
  pendingLoad.value = false
  if (intervalTimer) {
    clearTimeout(intervalTimer)
    intervalTimer = null
  }

  lastLoadTime.value = Date.now()
  loading.value = true
  emits('load-post')
}

onMounted(() => {
  if (props.initialPostList?.length > 0) {
    postList.value = [...props.initialPostList]
  }

  nextTick(() => {
    loadMore(false) // 首次加载，不应用最小间隔
  })

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore(true) // 触发器触发，应用最小间隔
      }
    },
    { rootMargin: '300px' },
  )

  if (loadTrigger.value) {
    observer.observe(loadTrigger.value)
  }

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  observer?.disconnect()
  if (intervalTimer) {
    clearTimeout(intervalTimer)
  }
  window.removeEventListener('resize', handleResize)
})

defineExpose({ addNewPostList })
</script>

<template>
  <div class="post-list">
    <div class="post-grid" :style="{ gridTemplateColumns: `repeat(${props.columns}, 1fr)` }">
      <router-link v-for="post in postList" :key="post.postId" class="post-card" :to="{ name: 'VideoWatchView', params: { postId: post.postId } }" target="_blank">
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
      </router-link>
    </div>

    <el-empty v-if="postList.length === 0 && !loading" description="暂无投稿" />

    <div v-if="loading" class="loading-indicator">
      <el-icon :size="20">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>

    <!-- 加载触发器 -->
    <div v-if="!noMore" ref="loadTrigger" class="load-trigger" />

    <!-- 没有更多时显示提示 -->
    <div v-if="noMore && postList.length > 0" class="no-more">没有更多投稿了</div>
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

  .post-card {
    display: block;
    text-decoration: none;
    color: inherit;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;

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
