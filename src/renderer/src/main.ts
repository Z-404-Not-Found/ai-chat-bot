import { createApp } from 'vue'
import App from './App.vue'

import './style.css'
import PrimeVue from 'primevue/config'
import MyPreset from './themes/myPreset'

import router from './routers'

createApp(App)
    .use(PrimeVue, {
        theme: {
            preset: MyPreset,
            options: {
                darkModeSelector: '.dark'
            }
        }
    })
    .use(router)
    .mount('#app')
