<script setup>
import { ElAvatar, ElButton } from 'element-plus'

const props = defineProps({
  width: {
    type: String,
    default: '100%',
  },
  commentList: {
    type: Array,
    default: () => [],
  },
  hasMore: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="comment-area" :style="{ width: width }">
    <!-- 头部统计 -->
    <div class="comment-header">
      <span class="comment-title">评论</span>
      <span class="comment-count">562</span>
      <div class="sort-tabs">
        <span class="tab active">最热</span>
        <span class="tab">最新</span>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div v-for="comment in commentList" :key="comment.commentId" class="comment-item level-0">
        <!-- 0级主评论 -->
        <div class="comment-main">
          <el-avatar :src="comment.avatar" class="user-avatar" :size="40" />
          <div class="comment-content">
            <div class="user-info">
              <span class="username">{{ comment.userName }}</span>
              <span class="comment-time">{{ comment.time }}</span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button link type="primary" class="action-btn">
                <span class="like-icon">👍</span> {{ comment.likes }}
              </el-button>
              <el-button link type="primary" class="action-btn">回复</el-button>
            </div>
          </div>
        </div>

        <!-- 1级及2级回复 -->
        <div v-if="comment.replies && comment.replies.length" class="replies-container">
          <div v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
            <el-avatar :src="reply.avatar" class="user-avatar" :size="36" />
            <div class="reply-content">
              <div class="user-info">
                <span class="username">{{ reply.userName }}</span>
                <span class="comment-time">{{ reply.time }}</span>
              </div>
              <div class="reply-text">{{ reply.content }}</div>
              <div class="comment-actions">
                <el-button link type="primary" class="action-btn">
                  <span class="like-icon">👍</span> {{ reply.likes }}
                </el-button>
                <el-button link type="primary" class="action-btn">回复</el-button>
              </div>

              <!-- 2级回复（暂不递归，未来可扩展） -->
              <div v-if="reply.replies && reply.replies.length" class="second-replies">
                <div v-for="subReply in reply.replies" :key="subReply.commentId" class="sub-reply">
                  <span class="username">@{{ subReply.userName }}</span>
                  <span class="reply-text">{{ subReply.content }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-text">加载中...</div>

      <!-- 无更多评论 -->
      <div v-if="!hasMore && commentList.length > 0" class="no-more">没有更多评论</div>
      <div v-if="commentList.length === 0" class="no-more">暂无评论</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.comment-area {
  overflow-y: hidden;
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  box-sizing: border-box;

  .comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;

    .comment-title {
      font-size: 18px;
      font-weight: 600;
      margin-right: 8px;
    }

    .comment-count {
      color: #909399;
      font-size: 15px;
    }

    .sort-tabs {
      margin-left: auto;
      display: flex;
      gap: 20px;

      .tab {
        font-size: 15px;
        color: #909399;
        cursor: pointer;
        padding: 4px 0;

        &.active {
          color: #409eff;
          font-weight: 500;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: #409eff;
          }
        }
      }
    }
  }

  .comment-list {
    .comment-item {
      margin-bottom: 24px;

      &.level-0 {
        .comment-main {
          display: flex;
          gap: 12px;
        }

        .user-avatar {
          flex-shrink: 0;
        }

        .comment-content {
          flex: 1;
          min-width: 0;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .username {
          font-weight: 500;
          color: #303133;
        }

        .comment-time {
          color: #909399;
          font-size: 13px;
        }

        .comment-text {
          font-size: 15px;
          line-height: 1.5;
          color: #303133;
          word-break: break-all;
        }

        .comment-actions {
          margin-top: 8px;
          display: flex;
          gap: 16px;

          .action-btn {
            padding: 0;
            font-size: 13px;
            color: #909399;

            .like-icon {
              margin-right: 4px;
            }
          }
        }
      }
    }

    .replies-container {
      margin-left: 52px;
      margin-top: 12px;
      border-left: 2px solid #f0f2f5;
      padding-left: 16px;

      .reply-item {
        display: flex;
        gap: 12px;
        margin-bottom: 18px;

        .user-avatar {
          flex-shrink: 0;
        }

        .reply-content {
          flex: 1;

          .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
          }

          .reply-text {
            font-size: 14px;
            line-height: 1.5;
            color: #303133;
          }

          .comment-actions {
            margin-top: 6px;
          }
        }
      }

      .second-replies {
        margin-top: 8px;
        padding-left: 48px;

        .sub-reply {
          font-size: 14px;
          color: #606266;
          margin-bottom: 4px;

          .username {
            color: #409eff;
            margin-right: 6px;
          }
        }
      }
    }
  }

  .loading-text {
    text-align: center;
    color: #909399;
    padding: 20px 0;
  }

  .no-more {
    text-align: center;
    color: #909399;
    font-size: 14px;
    padding: 30px 0 10px;
  }
}
</style>
