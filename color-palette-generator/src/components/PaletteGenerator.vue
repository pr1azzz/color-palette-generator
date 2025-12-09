<template>
  <div class="palette-generator">
    <!-- Заголовок -->
    <div class="header">
      <h1>🎨 Генератор цветовых палитр</h1>
      <p class="subtitle">Создавайте гармоничные цветовые схемы для ваших проектов</p>
    </div>

    <!-- Основные элементы управления -->
    <div class="controls">
      <button @click="generateRandomPalette" class="generate-btn">
        🎲 Случайная палитра
      </button>
      
      <div class="controls-group">
        <div class="control">
          <label>Количество цветов:</label>
          <select v-model="colorCount" @change="updateColorCount" class="select-input">
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="7">7</option>
          </select>
        </div>
        
        <div class="control">
          <label>Формат отображения:</label>
          <div class="format-toggle">
            <button 
              @click="displayFormat = 'hex'"
              :class="{ active: displayFormat === 'hex' }"
              class="format-btn"
            >
              HEX
            </button>
            <button 
              @click="displayFormat = 'rgb'"
              :class="{ active: displayFormat === 'rgb' }"
              class="format-btn"
            >
              RGB
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Палитра цветов -->
    <div class="palette-container">
      <div 
        v-for="(color, index) in palette" 
        :key="color.id"
        class="color-card"
        :style="{ backgroundColor: color.hex }"
        @click="copyToClipboard(color)"
        :class="{ locked: color.locked }"
      >
        <div class="color-info">
          <span class="color-value">
            {{ displayFormat === 'hex' ? color.hex : color.rgb }}
          </span>
        </div>
        <div class="color-actions">
          <button 
            @click.stop="toggleLock(index)"
            class="lock-btn"
            :title="color.locked ? 'Разблокировать' : 'Закрепить'"
          >
            {{ color.locked ? '🔒' : '🔓' }}
          </button>
          <div v-if="copiedIndex === index" class="copied-notification">
            Скопировано!
          </div>
        </div>
      </div>
    </div>

    <!-- Уведомление -->
    <transition name="fade">
      <div v-if="showNotification" class="notification">
        Цвет скопирован в буфер обмена!
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'PaletteGenerator',
  setup() {
    // Реактивные переменные
    const colorCount = ref(5)
    const displayFormat = ref('hex')
    const palette = ref([])
    const copiedIndex = ref(-1)
    const showNotification = ref(false)

    // Генерация случайного цвета
    const generateRandomColor = () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    }

    // Генерация палитры
    const generateRandomPalette = () => {
      const newPalette = []
      const lockedColors = palette.value.filter(c => c.locked)
      
      // Сохраняем закрепленные цвета
      newPalette.push(...lockedColors)
      
      // Добавляем новые цвета
      for (let i = newPalette.length; i < colorCount.value; i++) {
        const color = generateRandomColor()
        newPalette.push({
          id: Date.now() + i,
          hex: color,
          rgb: formatColor(color, 'rgb'),
          locked: false
        })
      }
      
      // Обрезаем до нужного количества
      palette.value = newPalette.slice(0, colorCount.value)
      
      // Сохраняем в localStorage
      localStorage.setItem('currentPalette', JSON.stringify(palette.value))
    }

    // Копирование в буфер обмена
    const copyToClipboard = async (color) => {
      const text = displayFormat.value === 'hex' ? color.hex : color.rgb
      await navigator.clipboard.writeText(text)
      copiedIndex.value = palette.value.indexOf(color)
      showNotification.value = true
      
      setTimeout(() => {
        showNotification.value = false
        copiedIndex.value = -1
      }, 2000)
    }

    // Закрепление цвета
    const toggleLock = (index) => {
      palette.value[index].locked = !palette.value[index].locked
      localStorage.setItem('currentPalette', JSON.stringify(palette.value))
    }

    // Обновление количества цветов
    const updateColorCount = () => {
      generateRandomPalette()
    }

    // Форматирование цвета
    const formatColor = (hex, format = 'hex') => {
      if (format === 'hex') {
        return hex
      }
      
      // Простая конвертация HEX в RGB
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (result) {
        const r = parseInt(result[1], 16)
        const g = parseInt(result[2], 16)
        const b = parseInt(result[3], 16)
        return `rgb(${r}, ${g}, ${b})`
      }
      return hex
    }

    // Загрузка из localStorage
    const loadFromStorage = () => {
      const saved = localStorage.getItem('currentPalette')
      if (saved) {
        palette.value = JSON.parse(saved)
        // Обновляем цветCount в соответствии с сохраненной палитрой
        colorCount.value = palette.value.length
      } else {
        generateRandomPalette()
      }
    }

    // Хук жизненного цикла
    onMounted(() => {
      loadFromStorage()
    })

    return {
      colorCount,
      displayFormat,
      palette,
      copiedIndex,
      showNotification,
      generateRandomPalette,
      copyToClipboard,
      toggleLock,
      updateColorCount
    }
  }
}
</script>

<style scoped>
.palette-generator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
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

.controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
}

.generate-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  border-radius: 25px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.generate-btn:hover {
  transform: translateY(-2px);
}

.controls-group {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control label {
  font-weight: 600;
  color: #4a5568;
}

.select-input {
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  width: 150px;
}

.format-toggle {
  display: flex;
  gap: 10px;
}

.format-btn {
  padding: 10px 20px;
  border: 2px solid #667eea;
  background: transparent;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.format-btn.active {
  background: #667eea;
  color: white;
}

.format-btn:hover:not(.active) {
  background: #e9d8fd;
}

.palette-container {
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.color-card {
  flex: 1;
  min-width: 150px;
  min-height: 200px;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.color-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.color-card.locked {
  box-shadow: 0 0 0 3px #fff, 0 0 0 6px #667eea;
}

.color-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.color-value {
  font-family: monospace;
  font-size: 14px;
}

.color-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.lock-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s;
}

.lock-btn:hover {
  transform: scale(1.1);
}

.copied-notification {
  position: absolute;
  top: 50px;
  right: 0;
  background: #38a169;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #38a169;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .palette-container {
    flex-direction: column;
  }
  
  .color-card {
    min-height: 150px;
  }
}
</style>