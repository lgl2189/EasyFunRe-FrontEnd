<script setup>
// 默认高度64px
import { ref } from 'vue'
import UserLoginComponent from '../user/UserLoginComponent.vue'
import { useUserStore } from '@/stores/user'
import HeaderUserCard from '../user/HeaderUserCard.vue'
// 参数
defineProps({
  // embed嵌入式用于嵌入到页面中，float悬浮式用于在页面中悬浮跟随显示
  type: {
    type: String,
    default: 'float',
    validator: (value) => {
      return ['embed', 'float'].includes(value)
    },
  },
})
// 变量
const userStore = useUserStore()
const isShowLoginModal = ref(false)
// 函数
const handleClickLoginBtn = () => {
  isShowLoginModal.value = !isShowLoginModal.value
}
</script>
<template>
  <div class="header">
    <div class="logo-wrap"></div>
    <div class="header-primary"></div>
    <div class="header-search"></div>
    <div class="header-user">
      <div class="user-login-btn" v-if="userStore.isLogin === false">
        <el-button @click="handleClickLoginBtn" size="large" color="#00aeec" :circle="true" style="color: white">
          登录
        </el-button>
        <UserLoginComponent v-model:show-modal="isShowLoginModal"></UserLoginComponent>
      </div>
      <div>
        <HeaderUserCard />
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.header {
  height: 64px;
  width: 100%;
  background-color: aliceblue;
  display: flex;
  align-items: center;
  .logo-wrap {
  }
  .header-primary {
  }
  .header-search {
  }
  .header-user {
    padding: 0 20px 0 0;
    display: flex;
    align-items: center;
    margin-left: auto;
    .user-login-btn {
      display: flex;
      align-self: center;
      justify-content: center;
    }
  }
}
.header-embed {
}
.header-float {
}
</style>
