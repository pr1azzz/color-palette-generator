<template>
  <div class="generator-view">
    <div class="header">
      <h1>🎨 Генератор цветовых палитр</h1>
      <p class="subtitle">Создавайте гармоничные цветовые схемы для ваших проектов</p>
    </div>

    <div class="generator-layout">
      <!-- Основной генератор -->
      <div class="main-generator">
        <PaletteGenerator @palette-generated="handlePaletteGenerated" />
      </div>
      
      <!-- Продвинутые инструменты -->
      <div class="advanced-tools">
        <div class="tools-section">
          <h3>🛠️ Продвинутые инструменты</h3>
          <ColorPicker @palette-generated="handleColorBasedPalette" />
        </div>
        
        <div class="tools-section">
          <h3>🔍 Анализ доступности</h3>
          <div class="accessibility-preview">
            <p>Используйте вкладку "Анализ" для проверки контрастности</p>
            <router-link to="/accessibility" class="btn btn-secondary">
              Перейти к анализу
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PaletteGenerator from '../components/PaletteGenerator.vue'
import ColorPicker from '../components/ColorPicker.vue'

export default {
  name: 'GeneratorView',
  components: {
    PaletteGenerator,
    ColorPicker
  },
  methods: {
    handlePaletteGenerated(palette) {
      console.log('Новая палитра сгенерирована:', palette)
    },
    handleColorBasedPalette(palette) {
      console.log('Палитра на основе цвета:', palette)
    }
  }
}
</script>

<style scoped>
.generator-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.subtitle {
  color: #718096;
  font-size: 1.1rem;
}

.generator-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .generator-layout {
    grid-template-columns: 1fr;
  }
}

.main-generator {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.advanced-tools {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tools-section {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.tools-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2d3748;
}

.accessibility-preview {
  text-align: center;
  padding: 1rem;
}

.accessibility-preview p {
  margin-bottom: 1rem;
  color: #718096;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}
</style>