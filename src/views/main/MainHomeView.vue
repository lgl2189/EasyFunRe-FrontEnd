<script setup>
import HeaderComponent from '@/components/common/HeaderComponent.vue'
import PostListView from './post/PostListView.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
<template>
  <div class="main-home-container">
    <div class="main-header">
      <HeaderComponent />
    </div>
    <div class="main-body">
      <PostListView v-if="route.name === 'MainHomeView'"></PostListView>
      <router-view v-else></router-view>
    </div>
  </div>
</template>
<style lang="less" scoped>
.main-home-container {
  .main-header {
    margin: 0;
    padding: 0;
    height: var(--header-height);
    width: 100%;
    background-color: transparent;
  }
  .main-body {
  }
}
</style>
