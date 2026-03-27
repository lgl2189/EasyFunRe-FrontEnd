<script setup>
import { ElButton, ElContainer, ElMain, ElRow, ElCol } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
  router.push({ name: 'MainHomeView' })
}
</script>

<template>
  <ElContainer class="page-404">
    <ElMain class="error-main">
      <ElRow justify="center" align="middle" class="error-content">
        <ElCol :span="18" :xs="22" :sm="20" :md="16" :lg="12" class="error-box">
          <!-- 404数字（核心视觉） -->
          <div class="error-number">404</div>
          <!-- 提示文本 -->
          <div class="error-text">页面不存在</div>
          <!-- 描述文本 -->
          <div class="error-desc">抱歉，你访问的页面可能已删除、更名或暂时不可用</div>
          <!-- 返回首页按钮 -->
          <ElButton class="home-btn" type="primary" size="large" @click="goToHome"> 返回首页 </ElButton>
        </ElCol>
      </ElRow>
    </ElMain>
  </ElContainer>
</template>

<style scoped lang="less">
.page-404 {
  height: 100vh;
  /* 淡蓝色系背景渐变，提升层次感 */
  background: linear-gradient(120deg, #e8f4fc, #f0f8ff);

  .error-main {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .error-content {
    height: 100%;
    align-items: center;
  }

  .error-box {
    text-align: center;
    padding: 60px 30px;
    background: #fff;
    border-radius: 12px;
    /* 柔和的阴影，提升立体感 */
    box-shadow: 0 8px 24px 0 rgba(64, 158, 255, 0.1);
    /* 鼠标悬浮动效 */
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 12px 32px 0 rgba(64, 158, 255, 0.15);
      transform: translateY(-2px);
    }

    // 404数字样式（淡蓝色主视觉）
    .error-number {
      font-size: 150px;
      font-weight: 800;
      /* 淡蓝色渐变文字 */
      background: linear-gradient(90deg, #409eff, #66b1ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 24px;
      line-height: 1;
      /* 轻微缩放动效 */
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    // 提示文本
    .error-text {
      font-size: 28px;
      color: #3370b3; /* 深一点的淡蓝，突出标题 */
      margin-bottom: 12px;
      font-weight: 600;
    }

    // 描述文本
    .error-desc {
      font-size: 16px;
      color: #6fa8e0; /* 浅淡蓝，次要文本 */
      margin-bottom: 40px;
      line-height: 1.6;
    }

    // 返回首页按钮
    .home-btn {
      background: #409eff; /* 主淡蓝色 */
      border-color: #409eff;
      padding: 12px 36px;
      font-size: 16px;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: #66b1ff; /* hover浅淡蓝 */
        border-color: #66b1ff;
        transform: translateY(-2px);
      }
    }
  }

  // 响应式适配（小屏幕优化）
  @media (max-width: 768px) {
    .error-box {
      .error-number {
        font-size: 100px;
      }

      .error-text {
        font-size: 22px;
      }

      .error-desc {
        font-size: 14px;
      }
    }
  }
}
</style>
