<script setup>
// 控制弹出框显示状态（支持v-model绑定）
const isShowModal = defineModel('showModal', {
  type: Boolean,
  default: false,
})

// 接收弹出框宽高配置参数
const props = defineProps({
  width: {
    type: String,
    default: '400px',
  },
  height: {
    type: String,
    default: '300px',
  },
  closeOnClickModal: {
    type: Boolean,
    default: false,
  },
})

// 关闭弹出框
const closeModal = () => {
  if (props.closeOnClickModal) {
    isShowModal.value = false
  }
}

// 暴露方法供外部调用
defineExpose({
  closeModal,
})
</script>

<template>
  <div v-if="isShowModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop :style="{ width: width, height: height }">
      <!-- 弹出框唯一内容插槽 -->
      <slot />
    </div>
  </div>
</template>

<style scoped lang="less">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  overflow: auto;
}
</style>
