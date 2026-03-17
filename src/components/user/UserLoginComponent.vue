<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import DialogComponent from '../common/DialogComponent.vue'
import { getLoginSms, loginBySms } from '@/apis/user'
import { RESPONSE_SUCCESS } from '@/constant/response-constant'
import { Form, Field, ErrorMessage } from 'vee-validate'
import yup from '@/main'
import { ElMessage } from 'element-plus'
import { processInitialLogin } from '@/utils/user'

// 控制弹出框显示状态
const isShowModal = defineModel('showModal', {
  type: Boolean,
  default: false,
})
// 登录方式：password-密码登录 sms-短信登录
const loginType = ref('password')
// 控制密码是否可见
const showPassword = ref(false)
// 验证码倒计时
const countdown = ref(0)
let timer = null

// 登录表单数据
const loginForm = reactive({
  account: '',
  password: '',
  phone: '',
  smsCode: '',
})
// 校验规则

const smsLoginForm = {
  validationSchema: yup.object({
    phone: yup
      .string()
      .required('手机号不能为空')
      .length(11, '手机号长度只能为11位数字')
      .matches(/^\d+$/, '手机号只能包含数字')
      .matches(/^1[3-9]\d{9}$/, '手机号格式不正确'),
    smsCode: yup.string().required('验证码不能为空').length(6, '验证码长度只能为6位数字').matches(/^\d+$/, '验证码只能包含数字'),
  }),
  initialValues: {
    phone: '',
    smsCode: '',
  },
  name: 'smsLoginForm',
}

// 密码登录暂存空的校验规则（保持结构统一）
const passwordLoginSchema = yup.object({
  account: yup.string(),
  password: yup.string(),
})
//函数

// 打开弹出框
const openModal = () => {
  isShowModal.value = true
}

// 关闭弹出框
const closeModal = () => {
  isShowModal.value = false
}

// 切换登录方式
const switchLoginType = (type) => {
  loginType.value = type
}

// 点击注册按钮切换到短信登录
const handleRegisterClick = () => {
  switchLoginType('sms')
}

// 切换密码可见性
const togglePasswordVisible = () => {
  showPassword.value = !showPassword.value
}

// 密码登录回调
const handleLogin = () => {
  // 调用登录接口逻辑
}

// 获取验证码回调
const handleGetCode = async (validateField) => {
  // 倒计时中不重复触发
  if (countdown.value > 0) return
  // 校验手机号格式
  const { valid } = await validateField('phone')
  if (!valid) {
    return
  }
  // 接口调用成功后启动倒计时（此处假设接口调用成功）
  countdown.value = 30
  // 清除之前的定时器（防止重复创建）
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
  // 调用发送验证码接口逻辑
  const res = await getLoginSms(loginForm.phone)

  if (res.status !== RESPONSE_SUCCESS) {
    ElMessage.error(res.message)
  }
  ElMessage.success('验证码已发送')
}

// 短信登录/注册回调
const handlePhoneLogin = async () => {
  // 调用短信登录/注册接口逻辑
  const res = await loginBySms(loginForm.phone, loginForm.smsCode)
  if (res.status === RESPONSE_SUCCESS) {
    {
      processInitialLogin(res)
      ElMessage.success('登录成功')
    }
  } else {
    ElMessage.error(res.message)
  }
}
// 生命周期函数
onUnmounted(() => {
  // 组件卸载时清除定时器
  if (timer) clearInterval(timer)
})

// 暴露方法供父组件调用
defineExpose({
  openModal,
})
</script>

<template>
  <DialogComponent v-model:showModal="isShowModal" width="450px" height="auto" :padding="0">
    <!-- 外层容器增加圆角和阴影 -->
    <div class="login-register-container">
      <div class="login-register-header">
        <span :class="['tab-item', { active: loginType === 'password' }]" @click="switchLoginType('password')"> 密码登录 </span>
        <span :class="['tab-item', { active: loginType === 'sms' }]" @click="switchLoginType('sms')"> 短信登录 </span>
        <span class="close-btn" @click="closeModal">×</span>
      </div>

      <div class="login-register-content">
        <!-- 密码登录区域 -->
        <div v-if="loginType === 'password'" class="login-box" enter-active-class="fade-in" leave-active-class="fade-out">
          <Form :validation-schema="passwordLoginSchema" @submit="handleLogin" class="form-group">
            <div class="account-input-box">
              <Field
                name="account"
                v-model="loginForm.account"
                type="text"
                placeholder="请输入账号/手机号"
                class="form-input account-input"
                autocomplete="username" />
            </div>
            <div class="error-container">
              <ErrorMessage name="account" class="error-message" />
            </div>

            <div class="password-input-box">
              <Field
                name="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input password-input"
                autocomplete="current-password" />
              <button type="button" class="toggle-password-btn" @click="togglePasswordVisible">
                {{ showPassword ? '隐藏' : '显示' }}
              </button>
            </div>
            <div class="error-container">
              <ErrorMessage name="password" class="error-message" />
            </div>

            <div class="btn-group password-login-btn-group">
              <button type="button" class="submit-btn register-btn" @click="handleRegisterClick">注册</button>
              <button type="submit" class="submit-btn login-btn">登录</button>
            </div>
          </Form>
        </div>

        <!-- 短信登录区域 -->
        <div v-if="loginType === 'sms'" class="login-box" enter-active-class="fade-in" leave-active-class="fade-out">
          <div class="form-group">
            <Form
              @submit="handlePhoneLogin"
              :validation-schema="smsLoginForm.validationSchema"
              :initial-values="smsLoginForm.initialValues"
              class="sms-form-content"
              v-slot="{ validateField }">
              <div class="phone-input-box">
                <Field
                  name="phone"
                  type="text"
                  placeholder="请输入手机号"
                  class="form-input phone-input"
                  autocomplete="phone"
                  v-model="loginForm.phone" />
                <button
                  type="button"
                  class="send-code-btn"
                  @click="handleGetCode(validateField)"
                  :class="{ disabled: countdown > 0 }">
                  {{ countdown > 0 ? `${countdown}s后重新发送` : '获取验证码' }}
                </button>
              </div>
              <div class="error-container">
                <ErrorMessage name="phone" class="error-message" />
              </div>
              <div class="code-input-wrapper">
                <Field
                  name="smsCode"
                  type="text"
                  placeholder="请输入6位验证码"
                  v-model="loginForm.smsCode"
                  class="form-input code-input"
                  autocomplete="smsCode" />
              </div>
              <div class="error-container">
                <ErrorMessage name="smsCode" class="error-message" />
              </div>
              <button type="submit" class="submit-btn sms-login-register-btn">登录/注册</button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  </DialogComponent>
</template>

<style scoped lang="less">
// 全局过渡动画
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
.fade-out {
  animation: fadeOut 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
}

// 外层容器 - 核心美化
.login-register-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

// 头部样式优化
.login-register-header {
  display: flex;
  justify-content: center;
  position: relative;
  padding: 20px 24px;
  border-bottom: 1px solid #f5f7fa;
  background: #fafbfc;

  .tab-item {
    font-size: 16px;
    margin: 0 24px;
    cursor: pointer;
    color: #606266;
    user-select: none;
    position: relative;
    padding-bottom: 8px;
    transition: color 0.2s ease;

    &.active {
      color: #409eff;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 2px;
        background: #409eff;
        border-radius: 1px;
      }
    }

    &:hover:not(.active) {
      color: #409eff;
    }
  }

  .close-btn {
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    cursor: pointer;
    color: #909399;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      color: #409eff;
      background: #ecf5ff;
    }
  }
}

// 内容区域样式
.login-register-content {
  padding: 24px;
}

.login-box {
  width: 100%;
}

.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;

  .form-input {
    width: 100%;
    height: 44px;
    padding: 0 16px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    box-sizing: border-box;
    font-size: 14px;
    color: #303133;
    transition: all 0.2s ease;
    background: #fff;

    &::placeholder {
      color: #c0c4cc;
    }

    &:focus {
      outline: none;
      border-color: #409eff;
      box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
    }

    &:hover {
      border-color: #c6e2ff;
    }
  }

  // 账号输入框
  .account-input-box {
    height: 44px;
  }

  // 密码输入框容器
  .password-input-box {
    display: flex;
    gap: 12px;
    height: 44px;

    .password-input {
      flex: 1;
    }

    .toggle-password-btn {
      width: 70px;
      height: 44px;
      background-color: #f5f7fa;
      color: #606266;
      border: 1px solid #e5e6eb;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;

      &:hover {
        background-color: #ecf5ff;
        color: #409eff;
        border-color: #c6e2ff;
      }
    }
  }

  // 手机号输入框容器
  .phone-input-box {
    display: flex;
    gap: 12px;
    height: 44px;

    .phone-input {
      flex: 1;
    }

    .send-code-btn {
      width: 130px;
      height: 44px;
      background-color: #409eff;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;

      &:hover {
        background-color: #66b1ff;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }

      &.disabled {
        background-color: #e5e6eb;
        color: #909399;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;

        &:hover {
          background-color: #e5e6eb;
        }
      }
    }
  }

  .code-input-wrapper {
    height: 44px;
  }

  // 错误提示优化（减小提示框高度）
  .error-container {
    min-height: 16px;
    display: flex;
    align-items: center;
    padding-left: 2px;

    .error-message {
      color: #f56c6c;
      font-size: 12px;
      line-height: 1;
      margin: 0;
      transition: all 0.2s ease;
    }
  }

  // 密码登录按钮组
  .password-login-btn-group {
    display: flex;
    gap: 12px;
    margin-top: 4px;

    .submit-btn {
      flex: 1;
      height: 46px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;

      &.register-btn {
        background-color: #f5f7fa;
        color: #606266;

        &:hover {
          background-color: #ecf5ff;
          color: #409eff;
        }
      }

      &.login-btn {
        background-color: #409eff;
        color: #fff;

        &:hover {
          background-color: #66b1ff;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
        }
      }
    }
  }

  // 短信登录按钮
  .sms-login-register-btn {
    width: 100%;
    height: 46px;
    background-color: #409eff;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: #66b1ff;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    }
  }
}

.sms-form-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}
</style>
