import { createApp } from 'vue'
import App from './App.vue'
import './assets/scss/_normalize.css'
import './styles.scss'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

app.mount('#app')
