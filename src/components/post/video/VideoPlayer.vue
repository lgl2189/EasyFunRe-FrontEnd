<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElSelect, ElOption, ElInput, ElButton } from 'element-plus'
import { VideoPlay, VideoPause, FullScreen, Close } from '@element-plus/icons-vue'

// 父组件传参
const props = defineProps({
  // 窗口模式宽度
  windowWidth: {
    type: [String, Number],
    default: '100%',
  },
  // 窗口模式高度
  windowHeight: {
    type: [String, Number],
    default: '100%',
  },
  // 视频播放地址
  videoSrc: {
    type: String,
    default: '',
  },
})

// 事件派发
const emit = defineEmits(['prevVideo', 'nextVideo'])

// 核心DOM引用
const videoRef = ref(null)
const playerWrapRef = ref(null)
// 进度条DOM引用
const progressBarRef = ref(null)

// 状态变量
const isPlaying = ref(false)
const isShowControl = ref(false)
const currentTime = ref(0)
const totalTime = ref(0)
const playSpeedList = ref([0.5, 0.75, 1, 1.25, 1.5, 2])
const currentSpeed = ref(1)
const barrageText = ref('')
// 进度条拖动状态
const isDragging = ref(false)
// 拖动过程中临时存储进度值
const tempCurrentTime = ref(0)

// 计算全屏状态（兼容多浏览器）
const isFullScreen = computed(() => {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
})

const isShowControlBar = computed(() => {
  // TODO: 全屏状态先暂时始终显示控制栏，可以改为几秒后自动隐藏
  if (isFullScreen.value) {
    return true
  } else if (isShowControl.value || isDragging.value) {
    return true
  }
  return false
})

// 格式化时间为 00:00 格式
const formatTime = (time) => {
  const minute = Math.floor(time / 60)
  const second = Math.floor(time % 60)
  return `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
}

// 播放/暂停切换
const togglePlay = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
    isPlaying.value = true
  } else {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

// 播放器容器点击事件：非控制栏区域点击切换播放暂停
const handlePlayerClick = (e) => {
  const controlBar = e.currentTarget.querySelector('.control-bar')
  if (!controlBar.contains(e.target)) {
    togglePlay()
  }
}

// 上一集
const handlePrev = () => {
  emit('prevVideo')
}

// 下一集
const handleNext = () => {
  emit('nextVideo')
}

// 倍速切换
const changeSpeed = (val) => {
  if (!videoRef.value) return
  videoRef.value.playbackRate = val
  currentSpeed.value = val
}

// 全屏/窗口切换（修复退出全屏失效问题，兼容多浏览器）
const toggleFullScreen = () => {
  if (!playerWrapRef.value) return
  const fullscreenElement =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  if (!fullscreenElement) {
    // 进入全屏 - 兼容不同浏览器前缀
    if (playerWrapRef.value.requestFullscreen) {
      playerWrapRef.value.requestFullscreen().catch(() => {})
    } else if (playerWrapRef.value.webkitRequestFullscreen) {
      playerWrapRef.value.webkitRequestFullscreen().catch(() => {})
    } else if (playerWrapRef.value.mozRequestFullScreen) {
      playerWrapRef.value.mozRequestFullScreen().catch(() => {})
    } else if (playerWrapRef.value.msRequestFullscreen) {
      playerWrapRef.value.msRequestFullscreen().catch(() => {})
    }
  } else {
    // 退出全屏 - 兼容不同浏览器前缀
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen().catch(() => {})
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen().catch(() => {})
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen().catch(() => {})
    }
  }
}

// 视频时间更新
const handleTimeUpdate = () => {
  if (!videoRef.value || isDragging.value) return
  currentTime.value = videoRef.value.currentTime
}

// 视频元数据加载完成
const handleLoadedMetadata = () => {
  if (!videoRef.value) return
  totalTime.value = videoRef.value.duration
}

// 鼠标进入显示控制栏
const handleMouseEnter = () => {
  isShowControl.value = true
}

// 鼠标离开隐藏控制栏
const handleMouseLeave = () => {
  isShowControl.value = false
}

// 发送弹幕（预留接口）
const sendBarrage = () => {
  if (!barrageText.value.trim()) return
  barrageText.value = ''
}

// 监听视频加载进度
const handleProgress = () => {
  if (!videoRef.value) return
}

// 监听视频可播放事件
const handleCanPlayThrough = () => {
  if (!videoRef.value) return
  // 移除自动播放逻辑，避免暂停后自动播放
}

// 进度条鼠标按下
const handleProgressBarDown = (e) => {
  if (!videoRef.value) return
  isDragging.value = true
  updateProgressByPosition(e)
}

// 进度条鼠标移动
const handleProgressBarMove = (e) => {
  if (!isDragging.value || !videoRef.value) return
  updateProgressByPosition(e)
}

// 根据鼠标位置更新进度（仅记录当前值，不实时修改视频播放位置）
const updateProgressByPosition = (e) => {
  if (!videoRef.value || !totalTime.value || !progressBarRef.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const newTime = position * totalTime.value
  tempCurrentTime.value = newTime
}

// 进度条鼠标松开
const handleProgressBarUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  // 同步视频实际播放状态到按钮状态
  if (videoRef.value) {
    // 拖动结束后设置实际播放进度
    videoRef.value.currentTime = tempCurrentTime.value
    currentTime.value = tempCurrentTime.value
    isPlaying.value = !videoRef.value.paused
    // 松开拖动时，若视频已暂停，则开始播放
    if (videoRef.value.paused) {
      videoRef.value.play()
      isPlaying.value = true
    }
  }
}

// 监听视频源变化，确保重新加载时触发 Range 请求
watch(
  () => props.videoSrc,
  (newSrc) => {
    if (newSrc && videoRef.value) {
      videoRef.value.src = newSrc
      videoRef.value.load()
      tempCurrentTime.value = 0 // 切换视频源重置拖动进度
    }
  },
  { immediate: true },
)

// 生命周期挂载
onMounted(() => {
  const video = videoRef.value
  if (video) {
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('canplaythrough', handleCanPlayThrough)
  }
  document.addEventListener('mousemove', handleProgressBarMove)
  document.addEventListener('mouseup', handleProgressBarUp)
})

// 生命周期卸载
onUnmounted(() => {
  const video = videoRef.value
  if (video) {
    video.removeEventListener('timeupdate', handleTimeUpdate)
    video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    video.removeEventListener('progress', handleProgress)
    video.removeEventListener('canplaythrough', handleCanPlayThrough)
  }
  document.removeEventListener('mousemove', handleProgressBarMove)
  document.removeEventListener('mouseup', handleProgressBarUp)
})
</script>

<template>
  <div class="video-player-root">
    <!-- 播放器主容器 -->
    <div
      ref="playerWrapRef"
      class="player-wrap"
      :style="{
        width: isFullScreen ? '100vw' : windowWidth,
        height: isFullScreen ? '100vh' : windowHeight,
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handlePlayerClick">
      <!-- 视频标签：优化 preload 为 metadata、添加 progress 事件监听 -->
      <video
        ref="videoRef"
        class="video-element"
        :src="videoSrc"
        preload="metadata"
        controlsList="nodownload"
        playsinline
        @progress="handleProgress"></video>

      <!-- 暂停状态右下角标志 -->
      <div class="pause-icon" v-show="!isPlaying">
        <VideoPause />
      </div>

      <!-- 悬浮控制栏（hover显示） -->
      <div class="control-bar" :class="{ 'control-show': isShowControlBar }">
        <!-- 进度条 - 绑定ref -->
        <div ref="progressBarRef" class="progress-bar" @mousedown="handleProgressBarDown">
          <div
            class="progress-current"
            :style="{ width: `${((isDragging ? tempCurrentTime : currentTime) / totalTime) * 100}%` }"></div>
        </div>

        <!-- 控制栏主体 左中右布局 -->
        <div class="control-content">
          <!-- 左侧操作区 -->
          <div class="control-left">
            <el-button icon="DArrowLeft" link @click="handlePrev" />
            <el-button :icon="isPlaying ? VideoPause : VideoPlay" link @click="togglePlay" />
            <el-button icon="DArrowRight" link @click="handleNext" />
            <span class="time-text"
              >{{ formatTime(isDragging ? tempCurrentTime : currentTime) }} / {{ formatTime(totalTime) }}</span
            >
          </div>

          <!-- 中间弹幕区（仅全屏显示） -->
          <div class="control-center" v-if="isFullScreen">
            <el-input v-model="barrageText" placeholder="发个友善的弹幕见证当下" size="small" @keyup.enter="sendBarrage" />
          </div>

          <!-- 右侧功能区 -->
          <div class="control-right">
            <el-select v-model="currentSpeed" size="small" @change="changeSpeed" class="speed-select">
              <el-option v-for="item in playSpeedList" :key="item" :label="item + 'x'" :value="item" />
            </el-select>
            <el-button :icon="isFullScreen ? Close : FullScreen" link @click="toggleFullScreen" />
          </div>
        </div>
      </div>
    </div>

    <!-- 窗口模式专属：外部弹幕输入区 -->
    <div class="barrage-outer" v-if="!isFullScreen">
      <el-input v-model="barrageText" placeholder="发个友善的弹幕见证当下" class="barrage-input" @keyup.enter="sendBarrage" />
      <el-button type="primary" @click="sendBarrage">发送</el-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.video-player-root {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .player-wrap {
    position: relative;
    background: #000;
    overflow: hidden;
    border-radius: 4px;
    cursor: pointer;

    .video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .pause-icon {
      position: absolute;
      right: 20px;
      bottom: 60px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 60px;
      opacity: 0.7;
      z-index: 5;
    }

    .control-bar {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      padding: 10px 15px;
      box-sizing: border-box;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 10;

      &.control-show {
        opacity: 1;
      }

      .progress-bar {
        width: 100%;
        height: 5px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 10px;
        cursor: pointer;
        transition: height 0.2s ease;

        &:hover {
          height: 8px;
        }

        .progress-current {
          height: 100%;
          background: #00a1d6;
          border-radius: 2px;
        }
      }

      .control-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;

        .control-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;

          .time-text {
            color: #fff;
            font-size: 12px;
            margin-left: 5px;
          }

          :deep(.el-button) {
            color: #fff;
            font-size: 18px;
          }
        }

        .control-center {
          flex: 1;
          max-width: 400px;

          :deep(.el-input__inner) {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: #fff;

            &::placeholder {
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }

        .control-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;

          .speed-select {
            width: 80px;

            :deep(.el-input__inner) {
              background: transparent;
              border: none;
              color: #fff;
            }
          }

          :deep(.el-button) {
            color: #fff;
            font-size: 18px;
          }
        }
      }
    }
  }

  .barrage-outer {
    display: flex;
    gap: 10px;
    align-items: center;

    .barrage-input {
      flex: 1;
    }
  }
}
</style>
