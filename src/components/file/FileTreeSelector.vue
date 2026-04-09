<script setup>
import { ref, computed, watch } from 'vue'
import { ElUpload, ElButton, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  // 用于调整部分提示文字，显示的文件类型名称，例如分P显示为3个视频，改为3个音频
  fileTypeText: {
    type: String,
    default: '视频',
  },
  // FileTreeSelector组件的selectIndex必须大于等于-1，初始值默认应为-1
  selectIndex: {
    type: Number,
    default: -1,
    validator: (value) => {
      return value >= -1
    },
  },
  // FileTreeSelector组件的uploadList必须为数组
  uploadListInitial: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return Array.isArray(value)
    },
  },
})
// Emit 事件（向父组件发送）
// 1. 更新选中索引
// @update:selectIndex
// payload: number   → 新的选中索引

// 2. 添加投稿
// @add-upload
// payload: Object   → 新添加的投稿项（包含 id、name、files 等）

// 3. 删除投稿
// @remove-upload
// payload: string   → 被删除投稿的 id

// 4. 添加分P
// @add-part
// payload: {
//   uploadId: string,     // 所属投稿的 id
//   part: Object          // 新添加的分P对象 {id, name, file}
// }

// 5. 移除分P
// @remove-part
// payload: {
//   uploadId: string,     // 所属投稿的 id
//   partId: string        // 被移除分P的 id
// }

// 6. 调整分P顺序（拖拽后）
// @reorder-part
// payload: {
//   uploadId: string,           // 所属投稿的 id
//   newOrder: string[]          // 调整后的所有分P id 数组（从上到下顺序）
// }
const emit = defineEmits(['update:selectIndex', 'add-upload', 'remove-upload', 'add-part', 'remove-part', 'reorder-part'])

// 组件内部维护的数据
const internalSelectIndex = ref(props.selectIndex)
const internalUploadList = ref([...props.uploadListInitial])

// 监听外部 prop 变化，同步到内部
watch(
  () => props.selectIndex,
  (newVal) => {
    internalSelectIndex.value = newVal
  },
  { immediate: true },
)

// 当前选中的投稿
const selectedUpload = computed(() => {
  if (internalSelectIndex.value >= 0 && internalUploadList.value[internalSelectIndex.value]) {
    return internalUploadList.value[internalSelectIndex.value]
  }
  return null
})

// 当前文件列表（用于第三部分显示）
const fileList = computed(() => {
  if (selectedUpload.value) {
    return selectedUpload.value.files || []
  }
  return []
})

// 生成唯一ID
const generateId = () => Date.now() + Math.random().toString(36).slice(2, 11)

// 添加投稿
const handleUploadSelect = (file) => {
  const newFileItem = {
    id: generateId(),
    name: file.name,
    files: [
      {
        id: generateId(),
        name: file.name,
        file: file,
      },
    ],
  }
  internalUploadList.value.push(newFileItem)
  emit('add-upload', newFileItem)

  // 自动选中新增的文件
  if (internalUploadList.value.length === 1) {
    internalSelectIndex.value = 0
    emit('update:selectIndex', 0)
  }

  ElMessage.success(`已添加文件: ${file.name}`)
  return false // 阻止默认上传行为
}

// 切换选中投稿
const selectUpload = (index) => {
  internalSelectIndex.value = index
  emit('update:selectIndex', index)
}

// 删除投稿
const removeUpload = (index) => {
  const fileToRemove = internalUploadList.value[index]
  let newIndex = internalSelectIndex.value
  if (internalSelectIndex.value === index) {
    newIndex = -1
  } else if (internalSelectIndex.value > index) {
    newIndex--
  }
  internalUploadList.value.splice(index, 1)
  emit('remove-upload', fileToRemove.id)
  emit('update:selectIndex', newIndex)
  ElMessage.info(`已移除文件: ${fileToRemove.name}`)
}

// 添加子文件
const handleAddPart = (file) => {
  if (internalSelectIndex.value < 0) {
    ElMessage.warning('请先选择一个投稿')
    return false
  }

  const selected = internalUploadList.value[internalSelectIndex.value]
  if (!selected.files) {
    selected.files = []
  }

  const newPart = {
    id: generateId(),
    name: file.name,
    file: file,
  }

  selected.files.push(newPart)

  emit('add-part', {
    uploadId: selected.id,
    part: newPart,
  })

  ElMessage.success(`已为 ${selected.name} 添加分P: ${file.name}`)
  return false // 阻止默认上传行为
}

// 移除子文件
const removePart = (partIndex) => {
  if (internalSelectIndex.value < 0) return
  const selectedFirst = internalUploadList.value[internalSelectIndex.value]
  if (selectedFirst.files && selectedFirst.files[partIndex]) {
    const removed = selectedFirst.files[partIndex]
    const removedName = removed.name
    selectedFirst.files.splice(partIndex, 1)

    emit('remove-part', {
      uploadId: selectedFirst.id,
      partId: removed.id,
    })

    ElMessage.info(`已移除分P: ${removedName}`)
  }
}

// 通过拖拽调整分P顺序
const handleDrop = (e, targetIndex) => {
  e.preventDefault()
  const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))

  if (sourceIndex === targetIndex || isNaN(sourceIndex)) return

  if (internalSelectIndex.value < 0) return

  const selectedFirst = internalUploadList.value[internalSelectIndex.value]
  if (!selectedFirst.files || selectedFirst.files.length <= 1) return

  const [movedItem] = selectedFirst.files.splice(sourceIndex, 1)
  selectedFirst.files.splice(targetIndex, 0, movedItem)

  emit('reorder-part', {
    uploadId: selectedFirst.id,
    newOrder: selectedFirst.files.map((item) => item.id),
  })

  ElMessage.success('分P顺序已调整')

  // 清理所有拖动预览样式
  document.querySelectorAll('.part-item').forEach((item) => {
    item.classList.remove('drag-over')
  })
}

// 1. 修改 uploadList 中指定列表项的 name
const updateUploadName = (id, newName) => {
  const item = internalUploadList.value.find((item) => item.id === id)
  if (item) {
    item.name = newName
  }
}

// 2. 获取整个 uploadList 对象
const getUploadList = () => {
  return [...internalUploadList.value]
}

// 3. 获取当前选中的索引对应的Upload对象
const getCurrentSelectIndex = () => {
  return internalSelectIndex.value
}
// 清空组件内部数据
const resetData = () => {
  internalSelectIndex.value = -1
  emit('update:selectIndex', -1)
  internalUploadList.value = []
}

// 暴露方法给父组件
defineExpose({
  updateUploadName,
  getUploadList,
  getCurrentSelectIndex,
  resetData,
})
</script>

<template>
  <div class="file-tree-selector">
    <!-- 第一部分：投稿添加器 -->
    <!-- 投稿卡片列表 -->
    <div class="file-card-container">
      <!-- 投稿卡片列表 -->
      <div
        class="file-card"
        v-for="(fileItem, index) in internalUploadList"
        :key="fileItem.id"
        :class="{ selected: internalSelectIndex === index }"
        @click="selectUpload(index)">
        <div class="file-card-center">
          <div class="file-card-title">
            <div class="file-card-filename">{{ fileItem.name }}</div>
          </div>
          <div class="file-card-sign">
            <el-icon><CircleCheck /></el-icon>
            <span>上传成功</span>
          </div>
        </div>
        <div class="file-card-right">
          <div class="file-card-remove" @click.stop="removeUpload(index)">
            <el-icon><Close /></el-icon>
          </div>
          <div class="file-card-part-count">{{ (fileItem.files || []).length }}个{{ fileTypeText }}</div>
        </div>
      </div>
      <!-- 投稿添加卡片 -->
      <div class="file-card add-card">
        <el-upload
          class="add-card-upload"
          action="#"
          :multiple="true"
          :show-file-list="false"
          :on-change="handleUploadSelect"
          :auto-upload="false"
          drag>
          <div class="add-card-inner">
            <div class="add-card-icon">
              <Plus></Plus>
            </div>
            <div class="add-card-text">添加投稿</div>
          </div>
        </el-upload>
      </div>
    </div>
    <!-- 第二部分：添加文件按钮 -->
    <div class="part-add-btn">
      <el-upload
        ref="partUploadRef"
        action="#"
        :multiple="true"
        :show-file-list="false"
        :on-change="handleAddPart"
        :auto-upload="false"
        :disabled="internalSelectIndex < 0">
        <el-button
          type="primary"
          class="add-part-btn"
          color="var(--color-blue-light)"
          :icon="Plus"
          :disabled="internalSelectIndex < 0">
          添加分P
        </el-button>
      </el-upload>
      <span v-if="internalSelectIndex < 0" class="tip-text">请先选择投稿</span>
    </div>
    <!-- 第三部分：文件列表 -->
    <div class="part-list-container">
      <div v-if="internalSelectIndex >= 0" class="upload-list">
        <div
          v-for="(part, index) in fileList"
          :key="part.id"
          class="part-item"
          @dragover="handleDragOver($event)"
          @dragleave="handleDragLeave($event)"
          @drop="handleDrop($event, index)">
          <div class="part-item-left">
            <div class="part-item-label" draggable="true" @dragstart="handleDragStart($event, index)">
              <div class="part-item-label-inner">P{{ index + 1 }}</div>
            </div>
            <div class="part-item-info">
              <div class="part-item-title">{{ part.name }}</div>
              <div class="part-item-status">
                <el-icon class="part-item-success"><CircleCheck /></el-icon>
                <span>上传完成</span>
              </div>
            </div>
          </div>
          <div class="part-item-right">
            <div v-if="fileList.length > 1" class="part-item-remove" @click="removePart(index)">
              <el-icon><Close /></el-icon>
            </div>
            <div class="part-item-replace" @click="replacePart(index)">
              <el-icon><Refresh /></el-icon>
            </div>
          </div>
          <div class="part-item-progress"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@file-card-max-width: 400px;
.file-tree-selector {
  width: 100%;
  font-size: 14px;
  .file-card-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, auto));
    justify-content: flex-start;
    gap: 15px;
    padding: 0 24px;
    margin: 0 auto;
    margin-bottom: 15px;
    .file-card {
      background: #fff;
      font-size: 14px;
      height: 70px;
      max-width: @file-card-max-width;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
      color: black;
      .file-card-center {
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: center;
        padding: 0 10px;
        .file-card-title {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          .file-card-filename {
            max-width: 150px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        .file-card-sign {
          font-size: 12px;
          color: #43ce5b;
          display: flex;
          align-items: center;
          & > span {
            margin-left: 2px;
          }
        }
      }
      .file-card-right {
        display: flex;
        flex-direction: column;
        align-items: end;
        justify-content: center;
        margin-right: 10px;
        .file-card-remove {
        }
        .file-card-part-count {
        }
      }
      &:hover {
        transform: translateY(-4px);
      }
      &.selected {
        color: white;
        background-color: var(--color-blue-light);
        .file-card-sign {
          color: hsla(0, 0%, 100%, 0.7);
        }
      }
    }
    .add-card {
      display: flex;
      justify-content: center;
      padding: 0;
      .add-card-upload {
        width: 100%;
        height: 100%;
        :deep(.el-upload) {
          width: 100%;
          height: 100%;
        }
        :deep(.el-upload-dragger) {
          border: none;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        .add-card-inner {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .add-card-icon {
            width: 15px;
            height: 15px;
            color: var(--color-prey);
          }
          .add-card-text {
          }
        }
      }
    }
  }
  .part-add-btn {
    margin-bottom: 15px;
    padding: 0 24px;
    .add-part-btn {
      color: white;
      width: 90px;
      height: 30px;
    }
  }
  .part-list-container {
    padding: 0 10px 24px;

    .upload-list {
      .part-item {
        position: relative;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        border: 1px solid #e9ecef;
        cursor: default;
        transition: all 0.2s ease;

        &.drag-over {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(64, 158, 255, 0.25);
          border-color: #409eff;
          background: #f0f7ff;
        }

        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
        }

        .part-item-left {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;

          .part-item-label {
            font-size: 12px;
            cursor: grab;
            height: 40px;
            width: 40px;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            .part-item-label-inner {
              background: #409eff;
              color: white;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 500;
            }
          }

          .part-item-info {
            flex: 1;
            min-width: 0;

            .part-item-title {
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              margin-right: 10px;
              word-break: break-all;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .part-item-status {
              display: flex;
              align-items: center;
              font-size: 13px;
              color: #43ce5b;

              .part-item-success {
                margin-right: 6px;
                font-size: 16px;
              }
            }
          }
        }

        .part-item-right {
          display: flex;
          gap: 8px;
          flex-shrink: 0;

          .part-item-remove,
          .part-item-replace {
            color: #999;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            &:hover {
              color: #f56c6c;
              background: #fee;
            }
          }

          .part-item-replace:hover {
            color: #409eff;
            background: #f0f7ff;
          }
        }

        .part-item-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, #67c23a, #85ce61);
          border-radius: 0 0 8px 8px;
        }
      }
    }
  }
}
</style>
