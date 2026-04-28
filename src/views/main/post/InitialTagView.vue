<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElTag, ElButton, ElMessage } from 'element-plus'
import { getTagList, initialUserTagList } from '@/apis/content'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'
// 变量
// 所有可选标签数据
const allTagList = ref([])
// 函数
const handleGetAllTagList = async () => {
  const res = await getTagList()
  if (res.status === RESPONSE_SUCCESS) {
    allTagList.value = res.data.tagList
    allTagList.value.forEach((tagItem, index) => {
      tagItem.id = index + 1
    })
  } else {
    ElMessage.error('获取标签列表失败，请重试')
  }
}

// 已选标签
const selectedTags = ref([])
// 最低选择数量
const minSelectCount = 3

// 标签点击切换
const toggleTag = (tag) => {
  const index = selectedTags.value.findIndex((item) => item.id === tag.id)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 判断是否达到最低选择数量
const isEnough = computed(() => {
  return selectedTags.value.length >= minSelectCount
})

// 确认提交
const handleConfirm = async () => {
  if (!isEnough.value) {
    ElMessage.warning(`请至少选择 ${minSelectCount} 个标签`)
    return
  }

  try {
    const res = await initialUserTagList(selectedTags.value)
    if (res.status === RESPONSE_SUCCESS) {
      ElMessage.success('标签保存成功')
    } else {
      ElMessage.error('标签保存失败，请重试')
    }
  } catch (error) {
    ElMessage.error('标签保存失败，请重试')
  }
}
// 生命周期
onMounted(() => {
  handleGetAllTagList()
})
</script>

<template>
  <div class="tag-select-container">
    <div class="header">
      <h2>选择你的兴趣标签</h2>
      <p>选择至少 {{ minSelectCount }} 个标签，帮助我们为你推荐更精准的视频</p>
    </div>

    <div class="tags-wrapper">
      <el-tag
        v-for="tag in allTagList"
        :key="tag.id"
        :type="selectedTags.some((item) => item.id === tag.id) ? 'primary' : 'info'"
        size="large"
        @click="toggleTag(tag)"
        class="tag-bubble">
        {{ tag.tagName }}
      </el-tag>
    </div>

    <div class="footer">
      <el-button type="primary" size="large" :disabled="!isEnough" @click="handleConfirm"> 确定 </el-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.tag-select-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;

  h2 {
    font-size: 28px;
    color: #333;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: #999;
  }
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 50px;
}

.tag-bubble {
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

.footer {
  text-align: center;
}
</style>
