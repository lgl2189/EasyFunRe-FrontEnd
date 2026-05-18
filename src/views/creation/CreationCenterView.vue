<script setup></script>

<template>
  <el-container class="creation-center-page">
    <!-- 顶部导航栏 -->
    <el-header class="top-header">
      <div class="header-inner">
        <!-- 左侧 logo 与主站入口 -->
        <div class="header-left">
          <span class="easyfun-logo">EasyFun</span>
          <span class="creation-title">创作中心</span>
          <router-link :to="{ name: 'MainHomeView' }" target="_blank" class="main-site-link"> 主站 </router-link>
        </div>

        <!-- 右侧用户信息 -->
        <div class="header-right">
          <el-avatar :size="32" class="user-avatar">UP</el-avatar>
          <el-button type="primary" plain class="up-days-btn"> 成为UP主的第{{ 1 }}天 </el-button>
        </div>
      </div>
    </el-header>

    <el-container class="body-container">
      <!-- 左侧功能菜单 -->
      <el-aside width="220px" class="side-aside">
        <!-- 投稿按钮 -->
        <div class="upload-wrapper">
          <router-link :to="{ name: 'CreationUploadView' }">
            <el-button type="primary" size="large" class="upload-btn">
              <el-icon><Upload /></el-icon>
              投稿
            </el-button>
          </router-link>
        </div>

        <!-- 二级目录菜单（仅保留要求中的两个一级目录） -->
        <el-menu
          :default-active="$route.path"
          class="side-menu"
          mode="vertical"
          router
          background-color="#ffffff"
          text-color="#333333"
          active-text-color="#00a1d6">
          <!-- 第一个一级目录：首页（直接链接） -->
          <el-menu-item index="/creation/home" :route="{ name: 'CreationCenterView' }">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <!-- 第二个一级目录：内容管理（仅作为目录，无直接链接） -->
          <el-sub-menu index="content-management">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </template>
            <!-- 内容管理的第一个二级目录：投稿管理 -->
            <el-menu-item index="/creation/content/submission-management"> 投稿管理 </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 右侧主要内容区（框架空位，待后续填充页面内容） -->
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="less" scoped>
.creation-center-page {
  background: #f4f4f4;
}

.top-header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 0;
  height: 60px;
  line-height: 60px;
  display: flex;
  align-items: center;

  .header-inner {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .easyfun-logo {
      color: #00a1d6;
      font-size: 22px;
      font-weight: 700;
    }

    .creation-title {
      font-size: 20px;
      font-weight: 600;
      color: #222;
    }

    .main-site-link {
      color: #666;
      font-size: 14px;
      text-decoration: none;
      padding: 0 20px;
      &:hover {
        color: #00a1d6;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-avatar {
      cursor: pointer;
    }

    .up-days-btn {
      border-radius: 9999px;
      padding: 0 18px;
      font-size: 14px;
    }
  }
}

.body-container {
  overflow: hidden;
}

.side-aside {
  background: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.upload-wrapper {
  padding: 20px 16px 12px;
}

.upload-btn {
  width: 100%;
  height: 52px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
}

.side-menu {
  flex: 1;
  border-right: none;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 52px;
    line-height: 52px;
    font-size: 15px;
  }

  :deep(.el-icon) {
    margin-right: 10px;
    font-size: 20px;
  }
}

.main-content {
  padding: 24px;
  overflow-y: auto;
  background: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;

  .empty-placeholder {
    text-align: center;
    color: #999;
    font-size: 15px;
    line-height: 1.6;
  }
}
</style>
