<script setup>
import { computed } from 'vue'

// 组件属性定义
const props = defineProps({
  // 组件类型：button-按钮 / link-链接
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'link'].includes(value),
  },
  // 背景颜色
  backgroundColor: {
    type: String,
    default: 'transparent',
  },
  // 文字颜色
  textColor: {
    type: String,
    default: '#ffffff',
  },
  // 链接地址（仅type为link时生效）
  href: {
    type: String,
    default: '',
  },
})

// 动态标签名计算
const tagName = computed(() => {
  return props.type === 'link' ? 'a' : 'button'
})

// 动态样式计算
const dynamicStyle = computed(() => {
  return {
    backgroundColor: props.backgroundColor,
    color: props.textColor,
  }
})
</script>

<template>
  <component :is="tagName" :href="type === 'link' ? href : undefined" class="universalBtn" :style="dynamicStyle">
    <slot></slot>
  </component>
</template>

<style scoped lang="less">
.universalBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: filter 0.3s ease;
  user-select: none;

  &:hover {
    filter: brightness(0.9);
  }

  &:focus {
    outline: none;
  }
}
</style>
