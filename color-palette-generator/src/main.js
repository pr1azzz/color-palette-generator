import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Импорт глобальных стилей (опционально)
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')