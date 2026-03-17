// 解决滚轮事件性能警告
// import 'default-passive-events'
// 核心依赖导入（略，保留原导入逻辑）
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isYesterday from 'dayjs/plugin/isYesterday'
import { pinia } from './stores/pinia'
import router from './router'
import './assets/less/base.less'
import { initUserEnvironment } from './utils/init-environment'
import * as yup from 'yup'
import { socketCenter } from './utils/stomp-center'
export default yup
// 配置 dayjs 插件
dayjs.extend(isSameOrBefore)
dayjs.extend(isYesterday)

// 异步初始化函数（定义在前，调用在后）
async function init() {
  try {
    // 初始化用户环境
    await initUserEnvironment()
    // 初始化 socket 连接
    socketCenter.init()
  } catch (error) {}
  return Promise.resolve()
}

// 应用初始化主流程
async function bootstrap() {
  const app = createApp(App)

  // 注册全局依赖
  app.use(ElementPlus)
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  app.use(pinia)
  app.use(router)

  // 先初始化环境，再挂载应用
  await init()
  // 无论初始化成功/失败，都挂载应用（也可根据业务跳转到错误页）
  app.mount('#app')
}

// 启动应用
bootstrap()
