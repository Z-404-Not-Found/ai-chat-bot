import { createApp } from 'vue'
import App from './App.vue'

import './style.css'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import router from './routers'

createApp(App)
    .use(PrimeVue, {
        theme: {
            preset: Aura
        }
    })
    .use(router)
    .mount('#app')
