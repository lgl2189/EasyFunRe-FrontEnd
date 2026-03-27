<script setup>
// 引入VeeValidate表单验证相关
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
// 引入ElementPlus组件及图标
import { ElCard, ElFormItem, ElRadio, ElButton, ElAvatar, ElIcon, ElMessage } from 'element-plus'
import { User, View, Hide } from '@element-plus/icons-vue'
// 引入Vue生命周期API
import { computed, onMounted, reactive, ref } from 'vue'
// 引入修改用户信息、密码的接口
import { getUserInfoAll, updateUserInfoAll, updateUserPassword } from '@/apis/user'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'
import { DATE_FORMAT } from '@/constant/datetime-constant'

// 变量
// 初始化用户Store
const userInfo = reactive({
  userId: '',
  username: '',
  password: null,
  phone: '',
  email: '',
  avatarUrl: '',
  gender: 0,
  birthday: '',
  introduction: '',
  currentArea: '',
  currentIp: '',
  interestTags: null,
  bgImageUrl: null,
})

const userInfoFormRef = ref(null)
const passwordFormRef = ref(null)

// 密码显示/隐藏状态
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 普通信息修改表单验证规则
const userInfoForm = {
  validationSchema: yup.object({
    username: yup.string().required('用户名不能为空').max(20, '用户名长度不能超过20个字符'),
    gender: yup.string().required('请选择性别'),
    birthday: yup.date().nullable().typeError('请选择有效的生日日期'),
    introduction: yup.string().max(500, '个人简介长度不能超过500个字符'),
  }),
  name: 'userInfoForm',
}

// 密码修改表单验证规则
const passwordForm = {
  validationSchema: yup.object({
    oldPassword: yup.string().when('$hasPassword', {
      is: true,
      then: (schema) => schema.required('请输入原密码'),
      otherwise: (schema) => schema.notRequired(),
    }),
    newPassword: yup
      .string()
      .required('请输入新密码')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
        '新密码需8-20位，包含大小写字母、数字和特殊字符',
      ),
    confirmPassword: yup
      .string()
      .required('请确认新密码')
      .oneOf([yup.ref('newPassword')], '两次输入的密码不一致'),
  }),
  name: 'passwordForm',
}
// 计算属性
const genderComputed = computed(() => {
  switch (userInfo.gender) {
    case 1:
      return '男'
    case 2:
      return '女'
    default:
      return '未知'
  }
})
// 函数
const handleGetUserInfo = async () => {
  const res = await getUserInfoAll()
  if (res.status !== RESPONSE_SUCCESS) {
    ElMessage.error('获取用户信息失败，请重试')
    return
  }
  Object.assign(userInfo, res.data)
}

// 普通信息修改提交处理
const handleModifySubmit = async (values) => {
  try {
    // 组装符合接口要求的参数：空值设为null，包含必填的userId
    const submitUserInfo = {
      userId: userInfo.userId,
      username: values.username,
      avatarUrl: userInfo.avatarUrl || null,
      gender: Number(values.gender),
      birthday: values.birthday || null,
      introduction: values.introduction || null,
    }
    const res = await updateUserInfoAll(submitUserInfo)
    if (res.status === RESPONSE_SUCCESS) {
      ElMessage.success('用户信息修改成功')
      // 提交成功后更新本地用户信息
      userInfo.username = values.username
      userInfo.gender = Number(values.gender)
      userInfo.birthday = values.birthday
      userInfo.introduction = values.introduction
    } else {
      ElMessage.error('用户信息修改失败，请重试')
    }
  } catch (error) {
    ElMessage.error('用户信息修改失败，请重试')
    console.error('信息修改错误：', error)
  }
}

// 密码修改提交处理
const handlePasswordSubmit = async (values) => {
  try {
    // 组装符合接口要求的密码参数
    const passwordInfo = {
      userId: userInfo.userId,
      oldPassword: userInfo.password ? values.oldPassword : null,
      newPassword: values.newPassword,
    }
    const res = await updateUserPassword(passwordInfo)
    if (res.status === RESPONSE_SUCCESS) {
      ElMessage.success('密码修改成功')
    } else {
      ElMessage.error('密码修改失败，请重试')
    }
  } catch (error) {
    ElMessage.error('密码修改失败，请重试')
    console.error('密码修改错误：', error)
  }
}

// 页面初始化时获取用户信息并初始化表单
onMounted(async () => {
  await handleGetUserInfo()
  if (userInfoFormRef.value) {
    userInfoFormRef.value.resetForm({
      values: {
        username: userInfo.username || '',
        gender: String(userInfo.gender) || '0',
        birthday: userInfo.birthday || null,
        introduction: userInfo.introduction || '',
      },
    })
  }
  if (passwordFormRef.value) {
    passwordFormRef.value.resetForm({
      values: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    })
  }
})
</script>

<template>
  <div class="user-info-container">
    <!-- 基本信息区 -->
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">基本信息</div>
      </template>
      <div class="card-body">
        <!-- 头像占位符 -->
        <el-avatar class="user-avatar" size="large">
          <el-icon>
            <User />
          </el-icon>
        </el-avatar>
        <p class="avatar-tip">头像功能待后端支持</p>
        <Form>
          <div class="info-item">
            <div class="info-label">用户ID：</div>
            <div class="info-value">{{ userInfo.userId }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">用户名：</div>
            <div class="info-value">{{ userInfo.username }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">性别：</div>
            <div class="info-value">{{ genderComputed }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">生日：</div>
            <div class="info-value">{{ userInfo.birthday || '未设置生日' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">简介：</div>
            <div class="info-value">{{ userInfo.introduction || '未设置简介' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">邮箱：</div>
            <div class="info-value">{{ userInfo.email || '未设置邮箱' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">手机号：</div>
            <div class="info-value">{{ userInfo.phone }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">邮箱：</div>
            <div class="info-value">{{ userInfo.email || '未设置邮箱' }}</div>
          </div>
        </Form>

        <!-- 基本信息修改表单区域 -->
        <div class="modify-form-container">
          <div class="card-header">修改基本信息</div>
          <Form
            ref="userInfoFormRef"
            class="modify-form"
            v-slot="{ handleSubmit }"
            :validation-schema="userInfoForm.validationSchema"
            :name="userInfoForm.name">
            <ElFormItem label="用户名" class="modify-form-item" label-width="120px">
              <Field name="username" placeholder="请输入用户名" v-slot="{ field, handleChange }">
                <el-input class="modify-input" :model-value="field.value" @update:model-value="handleChange"></el-input>
              </Field>
              <div class="error-container">
                <ErrorMessage name="username" class="error-message" />
              </div>
            </ElFormItem>

            <ElFormItem label="性别" class="modify-form-item" label-width="120px">
              <Field name="gender" class="modify-radio" v-slot="{ field, handleChange }">
                <el-radio-group :model-value="field.value" @update:model-value="handleChange">
                  <el-radio value="1">男</el-radio>
                  <el-radio value="2">女</el-radio>
                  <el-radio value="0">未知</el-radio>
                </el-radio-group>
              </Field>
              <div class="error-container">
                <ErrorMessage name="gender" class="error-message" />
              </div>
            </ElFormItem>

            <ElFormItem label="生日" class="modify-form-item" label-width="120px">
              <div class="date-field-wrapper">
                <Field name="birthday" v-slot="{ field, handleChange }">
                  <el-date-picker
                    class="modify-date"
                    v-model="field.value"
                    type="date"
                    placeholder="请选择生日"
                    :format="DATE_FORMAT"
                    :value-format="DATE_FORMAT"
                    @update:model-value="handleChange" />
                </Field>
              </div>
              <div class="error-container">
                <ErrorMessage name="birthday" class="error-message" />
              </div>
            </ElFormItem>

            <ElFormItem label="个人简介" class="modify-form-item" label-width="120px">
              <Field name="introduction" v-slot="{ field, handleChange }">
                <el-input
                  class="modify-textarea"
                  :model-value="field.value"
                  @update:model-value="handleChange"
                  :rows="5"
                  placeholder="请输入个人简介" />
              </Field>
              <div class="error-container">
                <ErrorMessage name="introduction" class="error-message" />
              </div>
            </ElFormItem>

            <el-button type="primary" class="submit-btn" @click="handleSubmit(handleModifySubmit)">保存修改</el-button>
          </Form>
        </div>
      </div>
    </el-card>

    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">{{ userInfo.password ? '修改密码' : '设置密码' }}</div>
      </template>
      <div class="card-body">
        <Form
          ref="passwordFormRef"
          class="password-form"
          v-slot="{ handleSubmit }"
          :validation-schema="passwordForm.validationSchema"
          :context="{ hasPassword: userInfo.password !== null }"
          :name="passwordForm.name">
          <ElFormItem label="原密码" class="password-form-item" v-if="userInfo.password">
            <Field name="oldPassword" v-slot="{ field, handleChange }">
              <el-input
                class="password-input"
                :model-value="field.value"
                @update:model-value="handleChange"
                :type="showOldPassword ? 'text' : 'password'"
                placeholder="请输入原密码">
                <template #suffix>
                  <el-icon class="eye-icon" @click="showOldPassword = !showOldPassword">
                    <component :is="showOldPassword ? Hide : View" />
                  </el-icon>
                </template>
              </el-input>
            </Field>
            <div class="error-container">
              <ErrorMessage name="oldPassword" class="error-message" />
            </div>
          </ElFormItem>

          <ElFormItem label="新密码" class="password-form-item">
            <Field name="newPassword" v-slot="{ field, handleChange }">
              <el-input
                class="password-input"
                :model-value="field.value"
                @update:model-value="handleChange"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="请输入新密码">
                <template #suffix>
                  <el-icon class="eye-icon" @click="showNewPassword = !showNewPassword">
                    <component :is="showNewPassword ? Hide : View" />
                  </el-icon>
                </template>
              </el-input>
            </Field>
            <div class="error-container">
              <ErrorMessage name="newPassword" class="error-message" />
            </div>
          </ElFormItem>

          <ElFormItem label="确认新密码" class="password-form-item">
            <Field name="confirmPassword" v-slot="{ field, handleChange }">
              <el-input
                class="password-input"
                :model-value="field.value"
                @update:model-value="handleChange"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入新密码">
                <template #suffix>
                  <el-icon class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
                    <component :is="showConfirmPassword ? Hide : View" />
                  </el-icon>
                </template>
              </el-input>
            </Field>
            <div class="error-container">
              <ErrorMessage name="confirmPassword" class="error-message" />
            </div>
          </ElFormItem>

          <el-button type="primary" class="password-submit-btn" @click="handleSubmit(handlePasswordSubmit)">修改密码</el-button>
        </Form>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="less">
.user-info-container {
  min-height: 100vh;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto; // 居中显示
  padding: 20px 20px 0 20px;

  .info-card {
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .card-header {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 15px;
    }

    .card-body {
      padding: 20px;
      box-sizing: border-box;

      // 不可修改信息样式
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        color: #666;

        .info-label {
          width: 120px;
          text-align: right;
          margin-right: 20px;
          font-weight: 500;
          color: #333;
        }

        .info-value {
          flex: 1;
          word-break: break-all;
        }
      }

      // 头像样式
      .user-avatar {
        margin: 0 20px 16px 140px;
        background-color: #409eff;
      }

      .avatar-tip {
        margin-left: 140px;
        color: #999;
        font-size: 12px;
        margin-bottom: 16px;
      }

      // 普通修改表单样式
      .modify-form-container {
        margin-top: 30px;
        border-top: 1px solid #eee;
        padding-top: 20px;
        margin-left: -20px;
        margin-right: -20px;
        padding-left: 20px;
        padding-right: 20px;
      }

      .modify-form {
        width: 60%;
        box-sizing: border-box;

        .modify-form-item {
          box-sizing: border-box;
          margin-bottom: 0px;
        }

        .modify-input,
        .modify-date,
        .modify-textarea,
        .modify-radio {
          width: 100%;
          box-sizing: border-box;
        }

        // 生日选择器包裹层
        .date-field-wrapper {
          width: 100%;
          box-sizing: border-box;
          display: block;
        }

        .submit-btn {
          margin-left: 120px;
        }
      }

      // 密码修改表单样式
      .password-form {
        width: 60%;
        box-sizing: border-box;

        .password-form-item {
          margin-bottom: 0;
          box-sizing: border-box;
        }

        .password-input {
          width: 100%;
          box-sizing: border-box;
        }

        .password-submit-btn {
          margin-left: 120px;
        }
      }

      // 错误提示容器
      .error-container {
        min-height: 16px;
        display: flex;
        align-items: center;
        padding-left: 2px;
        margin: 5px 0 5px 0;

        .error-message {
          color: #f56c6c;
          font-size: 12px;
          line-height: 1;
          margin: 0 0 0 3px;
          transition: all 0.2s ease;
        }
      }

      .eye-icon {
        cursor: pointer;
        color: #909399;
        font-size: 18px;
      }
    }
  }
}
</style>
