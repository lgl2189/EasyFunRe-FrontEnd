<script setup>
import { ElConfigProvider } from 'element-plus'
import HeaderComponent from './components/common/HeaderComponent.vue'
const zIndex = 3000
const size = 'small'
</script>

<template>
  <ElConfigProvider :size="size" :z-index="zIndex">
    <div id="app" class="root">
      <div class="container">
        <div class="root-header">
          <HeaderComponent />
        </div>
        <div class="root-body">
          <router-view />
        </div>
      </div>
    </div>
  </ElConfigProvider>
</template>

<style scoped>
.root {
  width: 100%;
  .container {
    width: min(100%, var(--page-max-width));
    margin: auto;
    padding: 0;
    .root-header {
      margin: 0;
      padding: 0;
      height: var(--header-height);
      width: 100%;
      background-color: transparent;
    }
    .root-body {
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: transparent;
    }
  }
}
</style>
