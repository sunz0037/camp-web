import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.js'
import './style.css'
import './styles/oa.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
useAuthStore(pinia).hydrate()
app.use(router)
app.mount('#app')
