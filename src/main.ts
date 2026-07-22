import { createApp } from 'vue'
import App from './App.vue'

// Self-hosted fonts (no CDN). Onest for UI, JetBrains Mono for data.
import '@fontsource/onest/400.css'
import '@fontsource/onest/500.css'
import '@fontsource/onest/600.css'
import '@fontsource/onest/700.css'
import '@fontsource/onest/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'

import './assets/scss/_normalize.css'
import './assets/scss/main.scss'
import router from './router'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import { useTheme } from '@/composables/useTheme'
import CustomSelectYear from "@/common/CustomSelectYear.vue"
import FavoriteButton from "@/common/FavoriteButton.vue"
import PaginationViews from "@/common/PaginationViews.vue"

// Initialise theme before mount so there is no flash of the wrong palette.
useTheme()

const app = createApp(App)

app.component('CustomSelectYear', CustomSelectYear)
app.component('FavoriteButton', FavoriteButton)
app.component('PaginationViews', PaginationViews)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(MotionPlugin)

app.mount('#app')
