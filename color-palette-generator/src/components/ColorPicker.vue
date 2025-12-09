<template>
  <div class="color-picker">
    <h3>🎨 Продвинутая генерация</h3>
    
    <!-- Выбор базового цвета -->
    <div class="color-selection">
      <label>Базовый цвет:</label>
      <div class="color-input-group">
        <input type="color" v-model="baseColor" class="color-input">
        <input type="text" v-model="baseColor" class="color-text">
        <div class="color-preview" :style="{ backgroundColor: baseColor }"></div>
      </div>
    </div>
    
    <!-- Выбор типа палитры -->
    <div class="palette-type">
      <label>Тип палитры:</label>
      <div class="type-buttons">
        <button 
          v-for="type in paletteTypes" 
          :key="type.value"
          @click="selectPaletteType(type.value)"
          :class="{ active: paletteType === type.value }"
          class="type-btn"
          :title="type.description"
        >
          {{ type.icon }} {{ type.label }}
        </button>
      </div>
    </div>
    
    <!-- Генерация по настроению -->
    <div class="mood-generation">
      <label>Генерация по настроению:</label>
      <div class="mood-buttons">
        <button 
          v-for="mood in moods" 
          :key="mood.value"
          @click="generateByMood(mood.value)"
          class="mood-btn"
          :style="{ backgroundColor: mood.color }"
        >
          {{ mood.icon }} {{ mood.label }}
        </button>
      </div>
    </div>
    
    <!-- Кнопка генерации -->
    <button @click="generatePalette" class="generate-btn">
      🚀 Сгенерировать палитру
    </button>
    
    <!-- Цветовой круг -->
    <div class="color-wheel-section">
      <h4>🎡 Цветовой круг</h4>
      <canvas ref="colorWheelCanvas" class="color-wheel"></canvas>
      <div class="wheel-legend">
        <div class="legend-item">
          <span class="legend-color" style="background: #ff0000"></span>
          <span>0° Красный</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #00ff00"></span>
          <span>120° Зеленый</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #0000ff"></span>
          <span>240° Синий</span>
        </div>
      </div>
    </div>
    
    <!-- Результат -->
    <div v-if="generatedPalette.length > 0" class="result-palette">
      <h4>Результат:</h4>
      <div class="palette-colors">
        <div 
          v-for="(color, index) in generatedPalette" 
          :key="index"
          class="result-color"
          :style="{ backgroundColor: color.hex }"
          @click="copyColor(color.hex)"
        >
          <span class="color-code">{{ color.hex }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'ColorPicker',
  emits: ['paletteGenerated'],
  setup(props, { emit }) {
    const baseColor = ref('#667eea')
    const paletteType = ref('analogous')
    const generatedPalette = ref([])
    const colorWheelCanvas = ref(null)
    
    const paletteTypes = [
      { value: 'analogous', label: 'Аналогичная', icon: '🔗', description: 'Цвета рядом на цветовом круге' },
      { value: 'monochromatic', label: 'Монохромная', icon: '🎨', description: 'Оттенки одного цвета' },
      { value: 'triadic', label: 'Триада', icon: '🔺', description: 'Три равноудаленных цвета' },
      { value: 'complementary', label: 'Комплементарная', icon: '⚡', description: 'Противоположные цвета' },
      { value: 'splitComplementary', label: 'Split', icon: '🎭', description: 'Цвет и два соседних к противоположному' },
      { value: 'tetradic', label: 'Тетрада', icon: '🔲', description: 'Четыре цвета в двух комплементарных парах' }
    ]
    
    const moods = [
      { value: 'calm', label: 'Спокойные', icon: '🌊', color: '#81c7d4' },
      { value: 'energetic', label: 'Энергичные', icon: '⚡', color: '#ff6b6b' },
      { value: 'professional', label: 'Профессиональные', icon: '💼', color: '#4a5568' },
      { value: 'warm', label: 'Теплые', icon: '🔥', color: '#ff8a65' },
      { value: 'cool', label: 'Холодные', icon: '❄️', color: '#64b5f6' }
    ]
    
    // Конвертация HEX в HSL
    const hexToHsl = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      const r = parseInt(result[1], 16) / 255
      const g = parseInt(result[2], 16) / 255
      const b = parseInt(result[3], 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2
      
      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }
      
      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      }
    }
    
    // Конвертация HSL в HEX
    const hslToHex = (h, s, l) => {
      h /= 360
      s /= 100
      l /= 100
      
      let r, g, b
      
      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p) * 6 * t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
          return p
        }
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
      }
      
      const toHex = x => {
        const hex = Math.round(x * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
    
    // Генерация палитры по типу
    const generatePalette = () => {
      const baseHsl = hexToHsl(baseColor.value)
      let colors = []
      
      switch (paletteType.value) {
        case 'analogous':
          colors = [
            hslToHex((baseHsl.h + 330) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l),
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 60) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 90) % 360, baseHsl.s, baseHsl.l)
          ]
          break
          
        case 'monochromatic':
          colors = [
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l - 20),
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l - 10),
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l),
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l + 10),
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l + 20)
          ]
          break
          
        case 'triadic':
          colors = [
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 60) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l)
          ]
          break
          
        case 'complementary':
          colors = [
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l - 15),
            hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l - 15),
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l + 15)
          ]
          break
          
        case 'splitComplementary':
          colors = [
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 150) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 210) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 330) % 360, baseHsl.s, baseHsl.l)
          ]
          break
          
        case 'tetradic':
          colors = [
            hslToHex(baseHsl.h, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 90) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 270) % 360, baseHsl.s, baseHsl.l),
            hslToHex((baseHsl.h + 45) % 360, baseHsl.s, baseHsl.l)
          ]
          break
      }
      
      generatedPalette.value = colors.map((hex, index) => ({
        id: Date.now() + index,
        hex,
        rgb: hexToRgb(hex)
      }))
      
      emit('paletteGenerated', generatedPalette.value)
    }
    
    // Генерация по настроению
    const generateByMood = (mood) => {
      let baseHue
      
      switch (mood) {
        case 'calm':
          baseHue = 200 // Сине-зеленые тона
          break
        case 'energetic':
          baseHue = 0 // Красные и оранжевые
          break
        case 'professional':
          baseHue = 240 // Синие тона
          break
        case 'warm':
          baseHue = 30 // Оранжевые
          break
        case 'cool':
          baseHue = 210 // Голубые
          break
        default:
          baseHue = 200
      }
      
      baseColor.value = hslToHex(baseHue, 70, 50)
      generatePalette()
    }
    
    // Выбор типа палитры
    const selectPaletteType = (type) => {
      paletteType.value = type
      generatePalette()
    }
    
    // Копирование цвета
    const copyColor = async (hex) => {
      await navigator.clipboard.writeText(hex)
      alert(`Цвет ${hex} скопирован в буфер обмена!`)
    }
    
    // Отрисовка цветового круга
    const drawColorWheel = () => {
      const canvas = colorWheelCanvas.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(centerX, centerY) - 5
      
      ctx.clearRect(0, 0, width, height)
      
      for (let angle = 0; angle < 360; angle += 0.5) {
        const startAngle = (angle - 0.5) * Math.PI / 180
        const endAngle = (angle + 0.5) * Math.PI / 180
        
        const hue = angle
        const saturation = 100
        const lightness = 50
        
        const color = hslToHex(hue, saturation, lightness)
        
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
      }
    }
    
    // HEX в RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return 'rgb(0, 0, 0)'
      
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      
      return `rgb(${r}, ${g}, ${b})`
    }
    
    // Наблюдатель за изменением базового цвета
    watch(baseColor, () => {
      generatePalette()
    })
    
    // Хук жизненного цикла
    onMounted(() => {
      drawColorWheel()
      generatePalette()
    })
    
    return {
      baseColor,
      paletteType,
      generatedPalette,
      colorWheelCanvas,
      paletteTypes,
      moods,
      selectPaletteType,
      generateByMood,
      generatePalette,
      copyColor
    }
  }
}
</script>

<style scoped>
.color-picker {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.color-picker h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.color-selection {
  margin-bottom: 1.5rem;
}

.color-selection label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.color-input-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.color-input {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: monospace;
}

.color-preview {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.palette-type {
  margin-bottom: 1.5rem;
}

.palette-type label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.type-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.type-btn {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.type-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.mood-generation {
  margin-bottom: 1.5rem;
}

.mood-generation label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.mood-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.mood-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s;
}

.mood-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.generate-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  transition: all 0.2s;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.color-wheel-section {
  margin-bottom: 1.5rem;
}

.color-wheel-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.color-wheel {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.wheel-legend {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.result-palette {
  margin-top: 1.5rem;
}

.result-palette h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.palette-colors {
  display: flex;
  gap: 0.5rem;
}

.result-color {
  flex: 1;
  height: 80px;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s;
}

.result-color:hover {
  transform: translateY(-5px);
}

.color-code {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem;
  font-size: 0.8rem;
  font-family: monospace;
  text-align: center;
}
</style>