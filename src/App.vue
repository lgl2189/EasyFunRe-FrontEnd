<script setup>
import { ElConfigProvider } from 'element-plus'
const zIndex = 3000
const size = 'small'
</script>

<template>
  <ElConfigProvider :size="size" :z-index="zIndex">
    <div id="app" class="root">
      <div class="root-body">
        <router-view />
      </div>
    </div>
  </ElConfigProvider>
</template>

<style scoped>
.root {
  width: 100%;
  .root-body {
    width: min(100%, var(--page-max-width));
    margin: auto;
    padding: 0;
    background-color: transparent;
  }
}
</style>
