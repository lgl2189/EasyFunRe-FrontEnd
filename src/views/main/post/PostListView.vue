<script setup>
import { getRandomPostList, getRecommendPostList } from '@/apis/content'
import InfiniteScrollPostList from '@/components/post/InfiniteScrollPostList.vue'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
// 变量
const postListRef = ref(null)
const userStore = useUserStore()
const hotPostPageNum = ref(0)

// 函数
const handleLoadPost = async () => {
  let res
  if (userStore.userId) {
    res = await getRecommendPostList()
  } else {
    hotPostPageNum.value = hotPostPageNum.value + 1
    res = await getRandomPostList(10, hotPostPageNum.value)
  }
  if (res.status === RESPONSE_SUCCESS) {
    postListRef.value?.addNewPostList(res.data.postList)
  }
}
</script>

<template>
  <div class="post-view-container">
    <div class="post-list-box">
      <InfiniteScrollPostList @load-post="handleLoadPost" ref="postListRef" :columns="5"></InfiniteScrollPostList>
    </div>
  </div>
</template>

<style lang="less" scoped>
.post-view-container {
  width: 100%;
  height: 100%;
  .post-list-box {
    margin: 40px 40px 20px;
  }
}
</style>
