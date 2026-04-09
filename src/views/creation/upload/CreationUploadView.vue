<script setup>
import FileTreeSelector from '@/components/file/FileTreeSelector.vue'
import { ref } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { ElUpload, ElIcon, ElButton, ElMessage, ElDialog, ElProgress } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { uploadVideoPost } from '@/apis/content'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'

// 变量
const selectedUploadCardIndex = ref(-1)
const fileTreeSelectorRef = ref(null)
const videoFormRef = ref(null)
// 新增：上传对话框及进度相关
const uploadDialogVisible = ref(false)
const uploadProgressList = ref([])

// 表单数据列表
const formDataList = ref([])

// 表单校验规则
const videoPostForm = {
  validationSchema: yup.object({
    title: yup.string().required('标题不能为空'),
    description: yup.string().required('描述不能为空'),
  }),
  initialValues: {
    coverUrl: '',
    coverFile: null, // 存储封面文件对象
    title: '',
    description: '',
  },
  name: 'videoPostForm',
}

// 封面上传：保存文件对象+预览URL
const handleCoverUpload = (file) => {
  if (!file || selectedUploadCardIndex.value === -1) return false

  const currentForm = formDataList.value[selectedUploadCardIndex.value]
  if (!currentForm) return false

  currentForm.coverFile = file // 保存原始文件对象（关键）
  currentForm.coverUrl = URL.createObjectURL(file) // 仅用于预览
  return false // 阻止默认上传行为
}

const handleSelectedIndexChange = (index) => {
  selectedUploadCardIndex.value = index
}

const handleAddUpload = (newFile) => {
  if (!newFile) return

  formDataList.value.push({
    id: newFile.id,
    coverUrl: '',
    coverFile: null, // 初始化封面文件对象
    title: '',
    description: '',
  })

  if (selectedUploadCardIndex.value === -1) {
    selectedUploadCardIndex.value = 0
  }
}

const handleRemoveUpload = (removeId) => {
  let targetIndex = 1
  formDataList.value.forEach((item) => {
    if (item.id === removeId) {
      targetIndex = formDataList.value.indexOf(item)
    }
  })
  // 释放URL，避免内存泄漏
  if (formDataList.value[targetIndex].coverUrl) {
    URL.revokeObjectURL(formDataList.value[targetIndex].coverUrl)
  }
  formDataList.value.splice(targetIndex, 1)
}

// 上传所有表单：核心逻辑
const handleSubmitAll = async () => {
  try {
    // 1. 校验所有表单（标题、描述、封面）
    let isAllValid = true
    for (let i = 0; i < formDataList.value.length; i++) {
      // 切换选中项，让表单校验对应项
      selectedUploadCardIndex.value = i
      // 校验标题和描述
      const validateResult = await videoFormRef.value.validate()
      if (!validateResult.valid) {
        isAllValid = false
        ElMessage.error(`第 ${i + 1} 个投稿：标题/描述不能为空`)
        break
      }
      // 校验封面文件
      if (!formDataList.value[i].coverFile) {
        isAllValid = false
        ElMessage.error(`第 ${i + 1} 个投稿：请上传封面`)
        break
      }
    }
    if (!isAllValid) return

    // 2. 获取视频文件列表（从FileTreeSelector）
    const videoFileList = fileTreeSelectorRef.value.getUploadList()
    if (videoFileList.length !== formDataList.value.length) {
      ElMessage.error('视频文件数量与表单数量不匹配')
      return
    }

    // 新增：初始化上传对话框和进度条
    uploadProgressList.value = new Array(formDataList.value.length).fill(0)
    uploadDialogVisible.value = true

    // 3. 遍历构建FormData并发送到后端
    for (let i = 0; i < formDataList.value.length; i++) {
      const formItem = formDataList.value[i]
      const videoData = videoFileList[i] // 拿到你提供的那个包含 files 数组的对象

      // 构建 FormData
      const formData = new FormData()

      // 1. 基础字段修正：必须和后端 VideoPostDTO 字段名完全一致
      formData.append('postTitle', formItem.title) // 后端是 postTitle，不是 title
      formData.append('postDescription', formItem.description) // 后端是 postDescription，不是 description

      // 2. 封面文件：如果 formItem.coverFile 也是组件包装对象，记得取 .raw
      formData.append('coverList', formItem.coverFile.raw || formItem.coverFile)

      // 3. 视频文件处理（核心逻辑）
      const isMultiPart = videoData.files.length > 1
      formData.append('isMultiPart', isMultiPart)

      videoData.files.forEach((fileWrapper, index) => {
        // 关键：提取真正的原生 File 对象
        // 根据你的结构，原生文件在 fileWrapper.file.raw
        // 如果 raw 取不到，尝试直接 fileWrapper.file
        const rawFile = fileWrapper.file.raw || fileWrapper.file

        if (rawFile && rawFile instanceof File) {
          // 多次 append 同一个字段名 videoList，后端会自动封装为 List<MultipartFile>
          formData.append('videoList', rawFile)

          // 如果是分P视频，还需要设置分P标题

          // 假设 formItem.partTitles 是分P标题数组，没有的话可以用文件名代替
          const partTitle = fileWrapper.name
          formData.append(`videoTitleList[${index}]`, partTitle)
        } else {
          console.error('未找到有效的原生 File 对象', fileWrapper)
        }
      })

      // 发送请求（新增：添加上传进度回调）
      const res = await uploadVideoPost(formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          uploadProgressList.value[i] = percent
        },
      })
      if (res.status !== RESPONSE_SUCCESS) {
        ElMessage.error(`第 ${i + 1} 个投稿上传失败：${res.data.message}`)
        uploadProgressList.value[i] = 100 // 失败也标记进度100
        continue
      }
      // 上传成功：释放预览URL，避免内存泄漏
      URL.revokeObjectURL(formItem.coverUrl)
      ElMessage.success(`第 ${i + 1} 个投稿上传成功`)
      uploadProgressList.value[i] = 100
    }

    // 4. 上传完成后重置
    formDataList.value = []
    selectedUploadCardIndex.value = -1
    uploadDialogVisible.value = false // 新增：关闭上传对话框
    ElMessage.success('所有视频上传完成！')
    fileTreeSelectorRef.value.resetData()
  } catch (error) {
    console.error('上传失败：', error)
    ElMessage.error(`上传失败：${error.response?.data?.message || '网络异常'}`)
    // uploadDialogVisible.value = false // 新增：异常时关闭对话框
  }
}
</script>

<template>
  <div class="video-post-page">
    <!-- 标题区域 -->
    <div class="title-bar">
      <span class="title-text">发布视频</span>
    </div>
    <div class="divider"></div>

    <!-- 视频输入区 -->
    <div class="video-input-area">
      <!-- 视频上传区域 -->
      <div class="video-upload-selector">
        <FileTreeSelector
          ref="fileTreeSelectorRef"
          v-model:select-index="selectedUploadCardIndex"
          @update:select-index="handleSelectedIndexChange"
          @add-upload="handleAddUpload"
          @remove-upload="handleRemoveUpload"></FileTreeSelector>
      </div>

      <!-- 表单区域 -->
      <div class="video-form-wrapper">
        <div v-if="selectedUploadCardIndex !== -1 && formDataList[selectedUploadCardIndex]">
          <Form
            ref="videoFormRef"
            :validation-schema="videoPostForm.validationSchema"
            :initial-values="formDataList[selectedUploadCardIndex]"
            class="video-form">
            <div class="form-item cover-form-item">
              <div class="form-label">
                <span class="required-mark">*</span>
                <span>封面</span>
              </div>
              <el-upload class="cover-uploader" :show-file-list="false" :before-upload="handleCoverUpload">
                <div class="cover-box">
                  <img
                    v-if="formDataList[selectedUploadCardIndex].coverUrl"
                    :src="formDataList[selectedUploadCardIndex].coverUrl"
                    class="cover-preview" />
                  <div v-else class="cover-placeholder">
                    <el-icon class="cover-icon">
                      <Edit />
                    </el-icon>
                    <span class="cover-text">封面设置</span>
                  </div>
                </div>
              </el-upload>
            </div>

            <div class="form-item text-form-item">
              <div class="form-label">
                <span class="required-mark">*</span>
                <span>标题</span>
              </div>
              <div class="form-content">
                <Field
                  name="title"
                  type="text"
                  placeholder="请输入视频标题"
                  v-model="formDataList[selectedUploadCardIndex].title"
                  class="form-input" />
                <ErrorMessage name="title" class="error-message" />
              </div>
            </div>

            <div class="form-item text-form-item">
              <div class="form-label">
                <span class="required-mark">*</span>
                <span>描述</span>
              </div>
              <div class="form-content">
                <Field
                  name="description"
                  as="textarea"
                  placeholder="请输入视频描述"
                  v-model="formDataList[selectedUploadCardIndex].description"
                  class="form-textarea" />
                <ErrorMessage name="description" class="error-message" />
              </div>
            </div>
          </Form>
        </div>

        <div class="submit-all-wrapper">
          <el-button type="primary" @click="handleSubmitAll">上传全部视频</el-button>
        </div>
      </div>
    </div>

    <!-- 新增：上传进度对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传中"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="400px">
      <div class="upload-progress-container">
        <p class="upload-tip">正在上传，请勿关闭</p>
        <div v-for="(progress, index) in uploadProgressList" :key="index" class="progress-item">
          <span>第 {{ index + 1 }} 个投稿：</span>
          <el-progress :percentage="progress" :status="progress === 100 ? 'success' : ''" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.video-post-page {
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  background: #fff;

  .title-bar {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 20px;

    .title-text {
      font-size: 22px;
      font-weight: 600;
      color: #333;
    }
  }

  .divider {
    height: 1px;
    background: #e4e7ed;
    margin: 0 20px;
  }

  .video-input-area {
    padding: 30px 20px;

    .video-upload-selector {
      width: 100%;
    }

    .video-form-wrapper {
      margin-top: 20px;

      .video-form {
        .form-item {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          width: 80px;
          height: 36px;
          margin-right: 12px;
          font-size: 14px;
          color: #606266;
          flex-shrink: 0;

          .required-mark {
            margin-right: 4px;
            color: #f56c6c;
          }
        }

        .form-content {
          flex: 1;
        }

        .form-input {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
        }

        .form-textarea {
          width: 100%;
          min-height: 80px;
          padding: 10px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
        }

        .error-message {
          color: #f56c6c;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }

        .cover-form-item {
          display: flex;
          align-items: flex-start;

          .cover-uploader {
            display: inline-block;
          }

          .cover-box {
            width: 160px;
            height: 90px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #dcdfe6;
            background: #f5f7fa;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cover-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .cover-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #909399;

            .cover-icon {
              font-size: 20px;
              margin-bottom: 6px;
            }

            .cover-text {
              font-size: 12px;
            }
          }
        }

        .text-form-item {
          display: flex;
          align-items: flex-start;
        }
      }

      .submit-all-wrapper {
        margin-top: 30px;
        display: flex;
        justify-content: center;
      }
    }
  }

  // 新增：上传进度对话框样式
  .upload-progress-container {
    .upload-tip {
      margin-bottom: 16px;
      color: #606266;
      font-size: 14px;
    }
    .progress-item {
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
      span {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: #606266;
      }
    }
  }
}
</style>
