import { createApp } from 'vue'
import App from './App.vue'
import './assets/scss/_normalize.css'
import './assets/scss/main.scss'
import router from './router'
import { createPinia } from 'pinia'
import CustomSelectYear from "@/common/CustomSelectYear.vue"
import FavoriteButton from "@/common/FavoriteButton.vue"
import PaginationViews from "@/common/PaginationViews.vue"

const app = createApp(App)

app.component('CustomSelectYear', CustomSelectYear)
app.component('FavoriteButton', FavoriteButton)
app.component('PaginationViews', PaginationViews)

const pinia = createPinia()
app.use(pinia)
app.use(router)

app.mount('#app')
