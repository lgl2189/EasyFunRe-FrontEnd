<script setup>
import { ElConfigProvider } from 'element-plus'
const zIndex = 3000
const size = 'small'
</script>

<template>
  <ElConfigProvider :size="size" :z-index="zIndex">
    <div id="app" class="root">
      <router-view></router-view>
    </div>
  </ElConfigProvider>
</template>

<style scoped>
.root {
  width: 100vw;
  height: 100vh;
  background-color: gainsboro;
}
</style>
