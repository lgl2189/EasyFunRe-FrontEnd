<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElButton, ElSlider, ElCard } from 'element-plus'
import { getUserRecommendParam, updateUserRecommendParam } from '@/apis/content'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'

// 变量
// 融合比例参数
const alpha = ref(0.5)
// 多样化强度参数
const wDiv = ref(0.5)
// 破圈强度参数
const wBound = ref(0.5)

//函数
const handleGetRecommendParam = async () => {
  const res = await getUserRecommendParam()
  if (res.status === RESPONSE_SUCCESS) {
    alpha.value = res.data.alpha
    wDiv.value = res.data.wdiv
    wBound.value = res.data.wbound
  }
}
// 保存参数
const handleSave = async () => {
  try {
    // 发送保存参数请求
    const res = await updateUserRecommendParam(alpha.value, wDiv.value, wBound.value)
    if (res.status === RESPONSE_SUCCESS) {
      ElMessage.success('参数保存成功')
    } else {
      ElMessage.error('参数保存失败')
    }
  } catch (error) {
    ElMessage.error('参数保存失败')
  }
}
// 生命周期
onMounted(() => {
  handleGetRecommendParam()
})
</script>

<template>
  <el-card class="param-card">
    <div class="param-item">
      <div class="param-label">融合比例 (alpha)</div>
      <el-slider v-model="alpha" :min="0" :max="1" :step="0.01" />
      <div class="param-value">{{ alpha }}</div>
    </div>
    <div class="param-item">
      <div class="param-label">多样化强度 (wDiv)</div>
      <el-slider v-model="wDiv" :min="0" :max="1" :step="0.01" />
      <div class="param-value">{{ wDiv }}</div>
    </div>
    <div class="param-item">
      <div class="param-label">破圈强度 (wBound)</div>
      <el-slider v-model="wBound" :min="0" :max="1" :step="0.01" />
      <div class="param-value">{{ wBound }}</div>
    </div>
    <el-button type="primary" @click="handleSave" class="save-btn">保存参数</el-button>
  </el-card>
</template>

<style scoped lang="less">
.param-card {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

.param-item {
  margin-bottom: 30px;
}

.param-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.param-value {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.save-btn {
  width: 100%;
}
</style>
