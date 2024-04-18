import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
// 如果需要密钥
window._AMapSecurityConfig = {
    securityJsCode: '0ec6fc2f01e9d1964ff45c78a09e32c7' // 开发环境使用
}
