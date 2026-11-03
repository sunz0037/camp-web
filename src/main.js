import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.js'
import { useThemeStore } from './stores/theme.js'
import './style.css'
import './styles/oa.css'
import './styles/themes.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
const auth = useAuthStore(pinia)
auth.hydrate()
if (auth.isAuthed) useThemeStore(pinia).load()
app.use(router)
app.mount('#app')
