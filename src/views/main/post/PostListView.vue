<script setup>
import { getRecommendPostList } from '@/apis/content'
import InfiniteScrollPostList from '@/components/post/InfiniteScrollPostList.vue'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'
import { ref } from 'vue'
// TODO：为登录时无法加载投稿列表，因为没有userId，没有做处理，可以先补充一个必须登陆提示
// 变量
const postListRef = ref(null)

// 函数
const handleLoadPost = async () => {
  const res = await getRecommendPostList()
  if (res.status === RESPONSE_SUCCESS) {
    postListRef.value?.addNewPost(res.data)
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
