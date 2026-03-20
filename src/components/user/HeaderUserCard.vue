<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 引入pinia用户状态管理
import { useUserStore } from '@/stores/user'
// 引入ElementPlus图标
import { User, VideoPlay, Star, Moon, SwitchButton, ArrowRight } from '@element-plus/icons-vue'
// 引入通用按钮组件
import UniversalActionBtn from '@/components/common/UniversalActionBtn.vue'
import { processLogout } from '@/utils/user'
import { ElMessage } from 'element-plus'

// 路由实例
const router = useRouter()
// 用户状态store
const userStore = useUserStore()

// 用户信息数据
const userInfo = ref({
  userName: '侑手明灯',
  userLevel: 6,
  isAnnualVip: true,
  coinCount: 84.2,
  bCoinCount: 0.5,
  followCount: 750,
  fansCount: 10,
  dynamicCount: 211,
})

// 跳转个人空间
const handleGoToSpace = () => {
  // 个人空间地址可自行配置
  router.push('')
}

// 退出登录处理
const handleLogout = () => {
  processLogout()
  ElMessage.success('退出登录成功')
}

// 组件挂载后获取用户信息（如需接口请求，放开下方注释即可）
// onMounted(() => {
//   axios.get('/api/user/info').then(res => {
//     userInfo.value = res.data
//   }).catch(err => {
//     console.error('用户信息获取失败', err)
//   })
// })
</script>

<template>
  <!-- 用户信息弹出框组件 -->
  <el-popover trigger="hover" placement="bottom" :width="320" popper-class="user-info-popover" :hide-after="200">
    <!-- 弹出框内容区域 -->
    <div class="popover-content">
      <!-- 信息展示区 -->
      <div class="info-wrapper">
        <!-- 用户名与会员标识 -->
        <div class="user-name-row">
          <span class="user-name">{{ userInfo.userName }}</span>
          <el-tag v-if="userInfo.isAnnualVip" type="danger" size="small" class="vip-tag"> 年度大会员 </el-tag>
          <el-tag type="danger" size="small" class="level-tag"> LV{{ userInfo.userLevel }} </el-tag>
        </div>

        <!-- 硬币与B币信息 -->
        <div class="coin-row">
          <span class="coin-item">硬币: {{ userInfo.coinCount }}</span>
          <span class="coin-item">B币: {{ userInfo.bCoinCount }}</span>
        </div>

        <!-- 关注、粉丝、动态数据 -->
        <div class="data-row">
          <div class="data-item">
            <span class="data-num">{{ userInfo.followCount }}</span>
            <span class="data-label">关注</span>
          </div>
          <div class="data-item">
            <span class="data-num">{{ userInfo.fansCount }}</span>
            <span class="data-label">粉丝</span>
          </div>
          <div class="data-item">
            <span class="data-num">{{ userInfo.dynamicCount }}</span>
            <span class="data-label">动态</span>
          </div>
        </div>

        <!-- 福利提示横幅 -->
        <div class="benefit-banner">
          <div class="benefit-text">
            <p class="benefit-title">您的特惠福利已到账</p>
            <p class="benefit-desc">大会员x联合会员低至4.0折</p>
          </div>
          <UniversalActionBtn type="link" text-color="#ff699e" background-color="transparent" class="member-btn">
            会员中心
          </UniversalActionBtn>
        </div>
      </div>

      <!-- 功能操作区（使用UniversalActionBtn组件） -->
      <div class="func-wrapper">
        <!-- 个人中心 -->
        <UniversalActionBtn type="button" @click="handleGoToSpace" class="func-btn">
          <el-icon class="func-icon"><User /></el-icon>
          <span class="func-text">个人中心</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </UniversalActionBtn>

        <!-- 投稿管理 -->
        <UniversalActionBtn type="button" class="func-btn">
          <el-icon class="func-icon"><VideoPlay /></el-icon>
          <span class="func-text">投稿管理</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </UniversalActionBtn>

        <!-- 推荐服务 -->
        <UniversalActionBtn type="button" class="func-btn">
          <el-icon class="func-icon"><Star /></el-icon>
          <span class="func-text">推荐服务</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </UniversalActionBtn>

        <!-- 主题设置 -->
        <UniversalActionBtn type="button" class="func-btn">
          <el-icon class="func-icon"><Moon /></el-icon>
          <span class="func-text">主题: 浅色</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </UniversalActionBtn>

        <!-- 退出登录 -->
        <UniversalActionBtn type="button" @click="handleLogout" class="func-btn logout-btn">
          <el-icon class="func-icon"><SwitchButton /></el-icon>
          <span class="func-text">退出登录</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </UniversalActionBtn>
      </div>
    </div>

    <!-- 触发元素：头像框 -->
    <template #reference>
      <div class="avatar-trigger">
        <el-avatar :size="40" src="" class="user-avatar">
          {{ userInfo.userName.charAt(0) }}
        </el-avatar>
      </div>
    </template>
  </el-popover>
</template>

<style lang="less" scoped>
// 根容器样式
.popover-content {
  width: 100%;
  background-color: #ffffff;

  // 信息展示区嵌套
  .info-wrapper {
    width: 100%;
    margin-bottom: 12px;

    // 用户名与会员标识行
    .user-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;

      .user-name {
        font-size: 22px;
        font-weight: 600;
        color: #ff699e;
        line-height: 1.2;
      }

      .vip-tag {
        background-color: #ff699e;
        border-color: #ff699e;
        font-weight: 500;
      }

      .level-tag {
        background-color: #ff2442;
        border-color: #ff2442;
        font-weight: 500;
      }
    }

    // 硬币与B币信息行
    .coin-row {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;

      .coin-item {
        font-size: 16px;
        color: #606266;
      }
    }

    // 关注/粉丝/动态数据行
    .data-row {
      display: flex;
      justify-content: space-around;
      margin-bottom: 16px;

      .data-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .data-num {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
        }

        .data-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }

    // 福利提示横幅
    .benefit-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 12px 16px;
      background: linear-gradient(90deg, #fff0f5 0%, #ffeaf4 100%);
      border-radius: 8px;
      box-sizing: border-box;

      .benefit-text {
        .benefit-title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #ff699e;
          line-height: 1.4;
        }

        .benefit-desc {
          margin: 0;
          font-size: 14px;
          color: #606266;
          line-height: 1.4;
        }
      }

      .member-btn {
        font-size: 16px;
        font-weight: 500;
        padding: 0;
      }
    }
  }

  // 功能操作区嵌套
  .func-wrapper {
    width: 100%;
    padding-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .func-btn {
      width: 100%;
      justify-content: flex-start;
      gap: 12px;
      background-color: #f5f7fa;

      // 鼠标悬浮样式
      &:hover {
        background-color: #ebeef5;
      }

      .func-icon {
        font-size: 20px;
        color: #606266;
      }

      .func-text {
        flex: 1;
        font-size: 16px;
        color: #303133;
      }

      .arrow-icon {
        font-size: 16px;
        color: #c0c4cc;
      }

      // 退出登录按钮特殊样式
      &.logout-btn {
        margin-top: 4px;
      }
    }
  }
}

// 触发头像样式
.avatar-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  .user-avatar {
    transition: transform 0.2s;
  }

  // 悬浮缩放效果
  &:hover .user-avatar {
    transform: scale(1.05);
  }
}

// 深度修改popover容器样式（Vue3 + Less 嵌套写法）
:deep(.user-info-popover) {
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
