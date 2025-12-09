<template>
  <div id="app">
    <!-- Навигация -->
    <nav class="main-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          🎨 PaletteGen
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            🏠 Главная
          </router-link>
          <router-link to="/generator" class="nav-link">
            🎨 Генератор
          </router-link>
          <router-link to="/library" class="nav-link">
            📚 Библиотека
          </router-link>
          <router-link to="/accessibility" class="nav-link">
            🔍 Анализ
          </router-link>
        </div>
        <div class="nav-actions">
          <button @click="toggleTheme" class="theme-toggle">
            {{ isDarkTheme ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Основное содержимое -->
    <main class="main-content" :class="{ dark: isDarkTheme }">
      <router-view></router-view>
    </main>

    <!-- Футер -->
    <footer class="app-footer" :class="{ dark: isDarkTheme }">
      <div class="footer-content">
        <p>Генератор цветовых палитр • Vue 3 + Vite • Контрольная работа №5</p>
        <div class="footer-links">
          <a href="https://vuejs.org" target="_blank">Vue.js</a> • 
          <a href="https://vitejs.dev" target="_blank">Vite</a> • 
          <a href="https://github.com" target="_blank">GitHub</a>
        </div>
        <p class="footer-note">
          Разработано для дисциплины "Фронтенд и бэкенд разработка"
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const isDarkTheme = ref(false)
    
    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value
      if (isDarkTheme.value) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
      localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
    }
    
    onMounted(() => {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        isDarkTheme.value = true
        document.documentElement.setAttribute('data-theme', 'dark')
      }
    })
    
    return {
      isDarkTheme,
      toggleTheme
    }
  }
}
</script>

<style>
:root {
  --bg-primary: #f8fafc;
  --text-primary: #1e293b;
  --nav-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --card-bg: white;
  --border-color: #e2e8f0;
}

[data-theme="dark"] {
  --bg-primary: #1a202c;
  --text-primary: #e2e8f0;
  --nav-bg: linear-gradient(135deg, #4c51bf 0%, #553c9a 100%);
  --card-bg: #2d3748;
  --border-color: #4a5568;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  transition: background-color 0.3s, color 0.3s;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Навигация */
.main-nav {
  background: var(--nav-bg);
  padding: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Основное содержимое */
.main-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  transition: background-color 0.3s;
}

.main-content.dark {
  background-color: var(--bg-primary);
}

/* Футер */
.app-footer {
  background-color: #2d3748;
  color: #cbd5e1;
  padding: 2rem 0;
  margin-top: auto;
}

.app-footer.dark {
  background-color: #1a202c;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.footer-links {
  margin: 1rem 0;
}

.footer-links a {
  color: #93c5fd;
  text-decoration: none;
  margin: 0 0.5rem;
}

.footer-links a:hover {
  text-decoration: underline;
}

.footer-note {
  margin-top: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Адаптивность */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .nav-links {
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .app-footer {
    padding: 1.5rem 0;
  }
}

/* Стили для карточек в темной теме */
[data-theme="dark"] .card,
[data-theme="dark"] .palette-generator,
[data-theme="dark"] .color-picker,
[data-theme="dark"] .tools-section {
  background-color: var(--card-bg);
  border-color: var(--border-color);
}

/* Стили для форм в темной теме */
[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
  background-color: #4a5568;
  color: #e2e8f0;
  border-color: #718096;
}

[data-theme="dark"] input:focus,
[data-theme="dark"] select:focus,
[data-theme="dark"] textarea:focus {
  border-color: #63b3ed;
}

/* Стили для кнопок в темной теме */
[data-theme="dark"] .btn-secondary {
  background-color: #4a5568;
  color: #e2e8f0;
}

[data-theme="dark"] .btn-secondary:hover {
  background-color: #718096;
}
</style>