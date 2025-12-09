<template>
  <div class="palette-preview">
    <h3>👁️ Превью палитры в интерфейсе</h3>
    
    <div class="preview-controls">
      <button @click="toggleBackground" class="bg-toggle">
        {{ isDarkBackground ? '🌙 Тёмный фон' : '☀️ Светлый фон' }}
      </button>
    </div>
    
    <div class="preview-container" :class="{ dark: isDarkBackground }">
      <!-- Mockup интерфейса -->
      <div class="ui-mockup">
        <div class="mockup-header" :style="{ backgroundColor: primaryColor }">
          <h4 class="mockup-title">Заголовок приложения</h4>
          <button class="mockup-button" :style="{ 
            backgroundColor: secondaryColor,
            color: getContrastColor(secondaryColor)
          }">
            Действие
          </button>
        </div>
        
        <div class="mockup-content">
          <div class="mockup-card" :style="{ 
            borderColor: tertiaryColor,
            backgroundColor: isDarkBackground ? '#2d3748' : '#ffffff'
          }">
            <h5 :style="{ color: primaryColor }">Карточка</h5>
            <p>Это пример карточки с использованием цветов палитры</p>
            <button class="mockup-card-btn" :style="{ 
              backgroundColor: accentColor,
              color: getContrastColor(accentColor)
            }">
              Кнопка
            </button>
          </div>
          
          <div class="mockup-list">
            <div 
              v-for="(item, index) in 3" 
              :key="index"
              class="mockup-list-item"
              :style="{ 
                borderLeftColor: paletteColors[index % paletteColors.length].hex,
                backgroundColor: isDarkBackground ? '#4a5568' : '#f7fafc'
              }"
            >
              Элемент списка {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'PalettePreview',
  props: {
    palette: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const isDarkBackground = ref(false)
    
    // Получаем основные цвета из палитры
    const primaryColor = computed(() => 
      props.palette[0]?.hex || '#667eea'
    )
    
    const secondaryColor = computed(() => 
      props.palette[1]?.hex || '#764ba2'
    )
    
    const tertiaryColor = computed(() => 
      props.palette[2]?.hex || '#f093fb'
    )
    
    const accentColor = computed(() => 
      props.palette[3]?.hex || '#f5576c'
    )
    
    const paletteColors = computed(() => props.palette)
    
    // Определяем контрастный цвет для текста
    const getContrastColor = (hexColor) => {
      const rgb = hexToRgb(hexColor)
      if (!rgb) return '#000000'
      
      // Формула яркости (luminance)
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
      return luminance > 0.5 ? '#000000' : '#ffffff'
    }
    
    // Вспомогательная функция
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }
    
    const toggleBackground = () => {
      isDarkBackground.value = !isDarkBackground.value
    }
    
    return {
      isDarkBackground,
      primaryColor,
      secondaryColor,
      tertiaryColor,
      accentColor,
      paletteColors,
      getContrastColor,
      toggleBackground
    }
  }
}
</script>

<style scoped>
.palette-preview {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.preview-controls {
  margin-bottom: 20px;
}

.bg-toggle {
  padding: 8px 16px;
  background: #e2e8f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.preview-container {
  border-radius: 10px;
  overflow: hidden;
}

.preview-container.dark {
  background: #1a202c;
}

.ui-mockup {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mockup-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mockup-title {
  color: white;
  margin: 0;
}

.mockup-button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.mockup-content {
  padding: 20px;
}

.mockup-card {
  padding: 20px;
  border: 2px solid;
  border-radius: 8px;
  margin-bottom: 20px;
}

.mockup-card h5 {
  margin-top: 0;
}

.mockup-card-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.mockup-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mockup-list-item {
  padding: 15px;
  border-left: 4px solid;
  border-radius: 4px;
}
</style>