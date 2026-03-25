// css+less导入
import './assets/css/base.less'
import './assets/css/global.css'
// 核心依赖导入（略，保留原导入逻辑）
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { pinia } from './stores/pinia'
import router from './router'
import { initUserEnvironment } from './utils/init-environment'
import * as yup from 'yup'
import { socketCenter } from './utils/stomp-center'
export default yup
// 配置 dayjs 插件
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isYesterday from 'dayjs/plugin/isYesterday'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/zh-cn' // 引入中文
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(isYesterday)
dayjs.locale('zh-cn') // 设置全局为中文
dayjs.extend(relativeTime)
dayjs.extend(isToday)

// 异步初始化函数（定义在前，调用在后）
async function init() {
  try {
    // 初始化用户环境
    await initUserEnvironment()
    // 初始化 socket 连接
    // socketCenter.init()
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

  // 先初始化环境，再挂载应用
  await init()
  // 挂在路由后会立刻触发全局导航守卫，所以挂载路由必须在初始化环境之后。
  // 否则会在未设置isLogin时出发导航，最终导致直接用浏览器地址栏跳转进需要登录的页面时
  // 会被认为是未登录，但是由于已登录，错误地跳转到首页
  app.use(router)
  // 无论初始化成功/失败，都挂载应用（也可根据业务跳转到错误页）
  app.mount('#app')
}

// 启动应用
bootstrap()
