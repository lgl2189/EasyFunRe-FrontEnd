import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)
// ElementPlus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// dayjs
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isYesterday from 'dayjs/plugin/isYesterday'
dayjs.extend(isSameOrBefore)
dayjs.extend(isYesterday)
// pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
// router
import router from './router'
app.use(router)
app.mount('#app')

//less
import './assets/less/base.less'
