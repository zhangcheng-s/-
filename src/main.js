import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入中文包（可选，让分页等组件显示中文）
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import './assets/ali-font-icon/iconfont.css'
import './assets/GIS-font-icon/iconfont.css'
import 'ol/ol.css';

const app = createApp(App)

// 使用 Element Plus 并设置语言
app.use(ElementPlus, {
    locale: zhCn,
})
app.use(router)
app.mount('#app');