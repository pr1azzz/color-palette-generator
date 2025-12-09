<template>
  <div class="accessibility-view">
    <div class="header">
      <h1>🔍 Анализ доступности цветов</h1>
      <p class="subtitle">Проверяйте контрастность по стандарту WCAG</p>
    </div>

    <div class="accessibility-content">
      <!-- Выбор цветов для анализа -->
      <div class="color-selection">
        <h2>Выберите цвета для анализа</h2>
        
        <div class="color-pickers">
          <div class="color-picker">
            <label>Цвет текста:</label>
            <div class="color-input-group">
              <input 
                type="color" 
                v-model="textColor" 
                class="color-input"
              />
              <input 
                type="text" 
                v-model="textColor" 
                class="color-text"
              />
              <div class="color-name">{{ getColorName(textColor) }}</div>
            </div>
          </div>
          
          <div class="color-picker">
            <label>Цвет фона:</label>
            <div class="color-input-group">
              <input 
                type="color" 
                v-model="backgroundColor" 
                class="color-input"
              />
              <input 
                type="text" 
                v-model="backgroundColor" 
                class="color-text"
              />
              <div class="color-name">{{ getColorName(backgroundColor) }}</div>
            </div>
          </div>
        </div>
        
        <div class="quick-colors">
          <h4>Быстрые сочетания:</h4>
          <div class="quick-buttons">
            <button 
              v-for="combination in quickCombinations" 
              :key="combination.name"
              @click="applyCombination(combination)"
              class="quick-btn"
              :title="combination.name"
            >
              {{ combination.icon }}
            </button>
          </div>
        </div>
      </div>

      <!-- Результаты анализа -->
      <div class="results-section">
        <h2>Результаты анализа</h2>
        
        <div class="contrast-preview">
          <div 
            class="contrast-sample"
            :style="{ 
              backgroundColor: backgroundColor,
              color: textColor 
            }"
          >
            <p class="sample-text-large">Пример текста крупного размера (≥ 18px)</p>
            <p class="sample-text-normal">Пример текста обычного размера (14-17px)</p>
            <p class="sample-text-small">Пример текста мелкого размера (< 14px)</p>
            <p class="sample-text-disabled" :style="{ opacity: 0.5 }">Пример неактивного текста</p>
          </div>
          
          <div class="contrast-info">
            <div class="contrast-score">
              <h3>Коэффициент контрастности</h3>
              <div class="score-value" :class="getContrastClass(contrastRatio)">
                {{ contrastRatio.toFixed(2) }}:1
              </div>
              <div class="score-description">
                {{ getContrastDescription(contrastRatio) }}
              </div>
            </div>
            
            <div class="wcag-compliance">
              <h3>Соответствие стандартам WCAG 2.1</h3>
              
              <div class="compliance-item" :class="{ pass: passesAANormal }">
                <span class="compliance-icon">{{ passesAANormal ? '✅' : '❌' }}</span>
                <div class="compliance-details">
                  <span class="compliance-label">AA (нормальный текст)</span>
                  <span class="compliance-status">
                    {{ passesAANormal ? 'Проходит' : 'Не проходит' }}
                  </span>
                  <span class="compliance-requirement">Минимум 4.5:1</span>
                </div>
              </div>
              
              <div class="compliance-item" :class="{ pass: passesAALarge }">
                <span class="compliance-icon">{{ passesAALarge ? '✅' : '❌' }}</span>
                <div class="compliance-details">
                  <span class="compliance-label">AA (крупный текст)</span>
                  <span class="compliance-status">
                    {{ passesAALarge ? 'Проходит' : 'Не проходит' }}
                  </span>
                  <span class="compliance-requirement">Минимум 3:1</span>
                </div>
              </div>
              
              <div class="compliance-item" :class="{ pass: passesAAANormal }">
                <span class="compliance-icon">{{ passesAAANormal ? '✅' : '❌' }}</span>
                <div class="compliance-details">
                  <span class="compliance-label">AAA (нормальный текст)</span>
                  <span class="compliance-status">
                    {{ passesAAANormal ? 'Проходит' : 'Не проходит' }}
                  </span>
                  <span class="compliance-requirement">Минимум 7:1</span>
                </div>
              </div>
              
              <div class="compliance-item" :class="{ pass: passesAAALarge }">
                <span class="compliance-icon">{{ passesAAALarge ? '✅' : '❌' }}</span>
                <div class="compliance-details">
                  <span class="compliance-label">AAA (крупный текст)</span>
                  <span class="compliance-status">
                    {{ passesAAALarge ? 'Проходит' : 'Не проходит' }}
                  </span>
                  <span class="compliance-requirement">Минимум 4.5:1</span>
                </div>
              </div>
              
              <div class="compliance-summary">
                <h4>Итоговый рейтинг:</h4>
                <div class="rating-badge" :class="getRatingClass(finalRating)">
                  {{ finalRating }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Подбор акцентных цветов -->
      <div class="accent-colors">
        <h2>🎯 Подбор акцентных цветов</h2>
        
        <div class="accent-controls">
          <div class="control-group">
            <label>Основной цвет:</label>
            <div class="color-input-group">
              <input type="color" v-model="accentBaseColor" />
              <input type="text" v-model="accentBaseColor" />
            </div>
          </div>
          
          <div class="control-group">
            <label>Целевой контраст:</label>
            <div class="contrast-slider">
              <input 
                type="range" 
                v-model="targetContrast" 
                min="3" 
                max="7" 
                step="0.5"
                class="slider"
              />
              <div class="slider-value">{{ targetContrast }}:1</div>
              <div class="slider-labels">
                <span>AA (3:1)</span>
                <span>AA (4.5:1)</span>
                <span>AAA (7:1)</span>
              </div>
            </div>
          </div>
          
          <div class="control-group">
            <label>Направление:</label>
            <div class="direction-buttons">
              <button 
                @click="accentDirection = 'darker'"
                :class="{ active: accentDirection === 'darker' }"
                class="direction-btn"
              >
                Темнее
              </button>
              <button 
                @click="accentDirection = 'lighter'"
                :class="{ active: accentDirection === 'lighter' }"
                class="direction-btn"
              >
                Светлее
              </button>
              <button 
                @click="accentDirection = 'complementary'"
                :class="{ active: accentDirection === 'complementary' }"
                class="direction-btn"
              >
                Комплементарный
              </button>
            </div>
          </div>
          
          <button @click="findAccentColors" class="find-btn">
            🔍 Найти акценты
          </button>
        </div>
        
        <div v-if="accentColors.length > 0" class="accent-results">
          <h3>Рекомендуемые акцентные цвета:</h3>
          <p class="results-info">
            Найдено {{ accentColors.length }} цветов с контрастом ≥ {{ targetContrast }}:1
          </p>
          
          <div class="accent-grid">
            <div 
              v-for="(color, index) in accentColors" 
              :key="index"
              class="accent-color"
              :style="{ backgroundColor: color.hex }"
              @click="applyAccentColor(color)"
            >
              <div class="accent-info">
                <span class="accent-hex">{{ color.hex }}</span>
                <span class="accent-contrast">Контраст: {{ color.contrast.toFixed(2) }}:1</span>
                <span class="accent-rating" :class="color.rating.toLowerCase()">
                  {{ color.rating }}
                </span>
              </div>
              <button 
                @click.stop="copyAccentColor(color.hex)"
                class="accent-copy-btn"
                title="Копировать цвет"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Рекомендации -->
      <div class="recommendations">
        <h2>💡 Рекомендации</h2>
        
        <div v-if="contrastRatio < 3" class="recommendation-card error">
          <h3>⚠️ Критическая проблема доступности</h3>
          <p>Текст практически нечитаем. Требуется существенное увеличение контрастности.</p>
          <ul class="recommendation-list">
            <li>Используйте более темный текст на светлом фоне</li>
            <li>Или более светлый текст на темном фоне</li>
            <li>Рассмотрите использование дополнительных визуальных средств</li>
          </ul>
        </div>
        
        <div v-else-if="contrastRatio < 4.5" class="recommendation-card warning">
          <h3>⚠️ Требуется улучшение</h3>
          <p>Контрастность достаточна только для крупного текста (≥ 18px).</p>
          <ul class="recommendation-list">
            <li>Увеличьте контраст для нормального текста</li>
            <li>Используйте крупный шрифт для важного текста</li>
            <li>Добавьте тень или обводку к тексту</li>
          </ul>
        </div>
        
        <div v-else-if="contrastRatio < 7" class="recommendation-card good">
          <h3>✅ Хороший уровень доступности</h3>
          <p>Цвета соответствуют стандарту AA для всего текста.</p>
          <ul class="recommendation-list">
            <li>Подходит для большинства пользователей</li>
            <li>Можно улучшить до уровня AAA</li>
            <li>Проверьте для пользователей с нарушением зрения</li>
          </ul>
        </div>
        
        <div v-else class="recommendation-card excellent">
          <h3>🎉 Отличная доступность</h3>
          <p>Цвета соответствуют самому строгому стандарту AAA.</p>
          <ul class="recommendation-list">
            <li>Отлично для пользователей с нарушением зрения</li>
            <li>Подходит для профессионального использования</li>
            <li>Рекомендуется для важного контента</li>
          </ul>
        </div>
      </div>

      <!-- Графическое представление цветового круга -->
      <div class="color-wheel-section">
        <h2>🎡 Цветовой круг</h2>
        <p class="section-description">Визуализация выбранных цветов на цветовом круге</p>
        
        <div class="wheel-container">
          <canvas ref="colorWheelCanvas" class="color-wheel-canvas"></canvas>
          <div class="wheel-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background: red"></span>
              <span>0° Красный</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: yellow"></span>
              <span>60° Желтый</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: green"></span>
              <span>120° Зеленый</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: cyan"></span>
              <span>180° Голубой</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: blue"></span>
              <span>240° Синий</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: magenta"></span>
              <span>300° Пурпурный</span>
            </div>
          </div>
        </div>
        
        <div class="wheel-info">
          <div class="info-item">
            <div class="info-color" :style="{ backgroundColor: textColor }"></div>
            <div class="info-text">
              <strong>Текст:</strong> {{ textColor }} ({{ getHslValues(textColor) }})
            </div>
          </div>
          <div class="info-item">
            <div class="info-color" :style="{ backgroundColor: backgroundColor }"></div>
            <div class="info-text">
              <strong>Фон:</strong> {{ backgroundColor }} ({{ getHslValues(backgroundColor) }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'AccessibilityView',
  setup() {
    // Основные цвета для анализа
    const textColor = ref('#000000')
    const backgroundColor = ref('#ffffff')
    
    // Для подбора акцентных цветов
    const accentBaseColor = ref('#667eea')
    const targetContrast = ref('4.5')
    const accentDirection = ref('complementary')
    const accentColors = ref([])
    
    // Цветовой круг
    const colorWheelCanvas = ref(null)
    
    // Быстрые цветовые сочетания
    const quickCombinations = [
      { name: 'Черный на белом', text: '#000000', bg: '#ffffff', icon: '⚫' },
      { name: 'Белый на черном', text: '#ffffff', bg: '#000000', icon: '⚪' },
      { name: 'Темно-синий на светло-сером', text: '#1a365d', bg: '#edf2f7', icon: '🔵' },
      { name: 'Темно-зеленый на бежевом', text: '#22543d', bg: '#f0fff4', icon: '🟢' },
      { name: 'Темно-красный на розовом', text: '#742a2a', bg: '#fff5f5', icon: '🔴' },
      { name: 'Золотой на темно-синем', text: '#d69e2e', bg: '#2d3748', icon: '🟡' }
    ]

    // ========== ОСНОВНЫЕ ФУНКЦИИ ДЛЯ АНАЛИЗА ==========
    
    // Конвертация HEX в RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    // Расчет относительной яркости цвета (WCAG формула)
    const calculateLuminance = (hexColor) => {
      const rgb = hexToRgb(hexColor)
      if (!rgb) return 0
      
      const normalize = (value) => {
        value /= 255
        return value <= 0.03928 
          ? value / 12.92 
          : Math.pow((value + 0.055) / 1.055, 2.4)
      }
      
      const r = normalize(rgb.r)
      const g = normalize(rgb.g)
      const b = normalize(rgb.b)
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    // Расчет коэффициента контрастности
    const contrastRatio = computed(() => {
      const lum1 = calculateLuminance(textColor.value)
      const lum2 = calculateLuminance(backgroundColor.value)
      
      const lighter = Math.max(lum1, lum2)
      const darker = Math.min(lum1, lum2)
      
      const ratio = (lighter + 0.05) / (darker + 0.05)
      return Math.max(1, Math.min(21, ratio)) // Ограничиваем от 1 до 21
    })

    // Проверка соответствия стандартам WCAG
    const passesAANormal = computed(() => contrastRatio.value >= 4.5)
    const passesAALarge = computed(() => contrastRatio.value >= 3)
    const passesAAANormal = computed(() => contrastRatio.value >= 7)
    const passesAAALarge = computed(() => contrastRatio.value >= 4.5)

    // Итоговый рейтинг
    const finalRating = computed(() => {
      if (contrastRatio.value >= 7) return 'AAA'
      if (contrastRatio.value >= 4.5) return 'AA'
      if (contrastRatio.value >= 3) return 'AA (только крупный)'
      return 'Недостаточно'
    })

    // ========== ФУНКЦИИ ДЛЯ ПОДБОРА АКЦЕНТНЫХ ЦВЕТОВ ==========
    
    // Конвертация HEX в HSL
    const hexToHsl = (hex) => {
      const rgb = hexToRgb(hex)
      if (!rgb) return { h: 0, s: 0, l: 0 }
      
      const r = rgb.r / 255
      const g = rgb.g / 255
      const b = rgb.b / 255
      
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

    // Расчет контрастности между двумя цветами
    const calculateContrast = (color1, color2) => {
      const lum1 = calculateLuminance(color1)
      const lum2 = calculateLuminance(color2)
      
      const lighter = Math.max(lum1, lum2)
      const darker = Math.min(lum1, lum2)
      
      return (lighter + 0.05) / (darker + 0.05)
    }

    // Поиск акцентных цветов
    const findAccentColors = () => {
      const baseHsl = hexToHsl(accentBaseColor.value)
      const target = parseFloat(targetContrast.value)
      const results = []
      
      // Генерируем цвета в разных направлениях
      for (let i = 0; i < 12; i++) {
        let hue, saturation, lightness
        
        switch (accentDirection.value) {
          case 'darker':
            hue = baseHsl.h
            saturation = Math.min(100, baseHsl.s + 10)
            lightness = Math.max(10, baseHsl.l - (i + 1) * 15)
            break
            
          case 'lighter':
            hue = baseHsl.h
            saturation = Math.min(100, baseHsl.s + 10)
            lightness = Math.min(90, baseHsl.l + (i + 1) * 15)
            break
            
          case 'complementary':
            hue = (baseHsl.h + 180 + i * 30) % 360
            saturation = Math.min(100, baseHsl.s + 20)
            lightness = baseHsl.l < 50 ? baseHsl.l + 30 : baseHsl.l - 30
            break
        }
        
        const accentColor = hslToHex(hue, saturation, lightness)
        const contrast = calculateContrast(accentBaseColor.value, accentColor)
        
        if (contrast >= target) {
          let rating = 'Недостаточно'
          if (contrast >= 7) rating = 'AAA'
          else if (contrast >= 4.5) rating = 'AA'
          
          results.push({
            hex: accentColor,
            contrast,
            rating,
            hue,
            saturation,
            lightness
          })
          
          if (results.length >= 6) break
        }
      }
      
      accentColors.value = results
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    
    // Получение названия цвета
    const getColorName = (hex) => {
      const colors = {
        '#000000': 'Черный',
        '#ffffff': 'Белый',
        '#ff0000': 'Красный',
        '#00ff00': 'Зеленый',
        '#0000ff': 'Синий',
        '#ffff00': 'Желтый',
        '#ff00ff': 'Пурпурный',
        '#00ffff': 'Голубой',
        '#808080': 'Серый',
        '#ffa500': 'Оранжевый',
        '#800080': 'Фиолетовый',
        '#a52a2a': 'Коричневый',
        '#ffc0cb': 'Розовый'
      }
      return colors[hex.toLowerCase()] || 'Пользовательский цвет'
    }

    // Получение HSL значений
    const getHslValues = (hex) => {
      const hsl = hexToHsl(hex)
      return `H:${hsl.h}° S:${hsl.s}% L:${hsl.l}%`
    }

    // Применение быстрого сочетания
    const applyCombination = (combination) => {
      textColor.value = combination.text
      backgroundColor.value = combination.bg
    }

    // Применение акцентного цвета
    const applyAccentColor = (color) => {
      textColor.value = color.hex
    }

    // Копирование акцентного цвета
    const copyAccentColor = async (hex) => {
      try {
        await navigator.clipboard.writeText(hex)
        alert(`Цвет ${hex} скопирован в буфер обмена!`)
      } catch (err) {
        console.error('Ошибка копирования:', err)
      }
    }

    // Получение класса для контраста
    const getContrastClass = (ratio) => {
      if (ratio >= 7) return 'excellent'
      if (ratio >= 4.5) return 'good'
      if (ratio >= 3) return 'warning'
      return 'error'
    }

    // Описание контраста
    const getContrastDescription = (ratio) => {
      if (ratio >= 7) return 'Отличный контраст (AAA)'
      if (ratio >= 4.5) return 'Хороший контраст (AA)'
      if (ratio >= 3) return 'Минимальный контраст (только для крупного текста)'
      return 'Недостаточный контраст'
    }

    // Получение класса для рейтинга
    const getRatingClass = (rating) => {
      if (rating.includes('AAA')) return 'aaa'
      if (rating.includes('AA')) return 'aa'
      return 'insufficient'
    }

    // ========== ЦВЕТОВОЙ КРУГ ==========
    
    // Отрисовка цветового круга
    const drawColorWheel = () => {
      const canvas = colorWheelCanvas.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(centerX, centerY) - 10
      
      // Очищаем canvas
      ctx.clearRect(0, 0, width, height)
      
      // Рисуем цветовой круг
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
      
      // Отмечаем выбранные цвета
      const textHsl = hexToHsl(textColor.value)
      const bgHsl = hexToHsl(backgroundColor.value)
      
      // Текст
      drawColorPoint(ctx, centerX, centerY, radius, textHsl.h, '#000000', 'Т')
      
      // Фон
      drawColorPoint(ctx, centerX, centerY, radius, bgHsl.h, '#ffffff', 'Ф')
    }
    
    // Отрисовка точки на цветовом круге
    const drawColorPoint = (ctx, centerX, centerY, radius, hue, color, label) => {
      const angle = (hue - 90) * Math.PI / 180
      const pointRadius = 20
      const x = centerX + (radius * 0.7) * Math.cos(angle)
      const y = centerY + (radius * 0.7) * Math.sin(angle)
      
      // Рисуем круг
      ctx.beginPath()
      ctx.arc(x, y, pointRadius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Добавляем текст
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, x, y)
    }

    // ========== НАБЛЮДАТЕЛИ И ЖИЗНЕННЫЙ ЦИКЛ ==========
    
    // Наблюдатель за изменением цветов
    watch([textColor, backgroundColor], () => {
      // Перерисовываем цветовой круг
      drawColorWheel()
    })

    // Хук жизненного цикла
    onMounted(() => {
      // Инициализация цветового круга
      drawColorWheel()
      
      // Поиск акцентных цветов при загрузке
      findAccentColors()
    })

    return {
      // Данные
      textColor,
      backgroundColor,
      accentBaseColor,
      targetContrast,
      accentDirection,
      accentColors,
      colorWheelCanvas,
      quickCombinations,
      
      // Вычисляемые свойства
      contrastRatio,
      passesAANormal,
      passesAALarge,
      passesAAANormal,
      passesAAALarge,
      finalRating,
      
      // Методы
      getColorName,
      getHslValues,
      applyCombination,
      applyAccentColor,
      copyAccentColor,
      findAccentColors,
      getContrastClass,
      getContrastDescription,
      getRatingClass
    }
  }
}
</script>

<style scoped>
.accessibility-view {
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
  max-width: 600px;
  margin: 0 auto;
}

/* Общие стили секций */
.accessibility-content > * {
  margin-bottom: 3rem;
}

/* Стили для выбора цветов */
.color-selection {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.color-selection h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.color-pickers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.color-picker label {
  font-weight: 600;
  color: #4a5568;
  font-size: 1.1rem;
}

.color-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-input-group > div {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.color-text {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: monospace;
  font-size: 1rem;
}

.color-text:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.color-name {
  color: #718096;
  font-size: 0.9rem;
  font-style: italic;
}

.quick-colors {
  margin-top: 1.5rem;
}

.quick-colors h4 {
  margin-bottom: 1rem;
  color: #4a5568;
}

.quick-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Стили для результатов анализа */
.results-section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.results-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.contrast-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .contrast-preview {
    grid-template-columns: 1fr;
  }
}

.contrast-sample {
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 2px solid #e2e8f0;
  min-height: 300px;
}

.sample-text-large {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.sample-text-normal {
  font-size: 1rem;
  margin: 0;
}

.sample-text-small {
  font-size: 0.875rem;
  margin: 0;
}

.sample-text-disabled {
  font-size: 1rem;
  margin: 0;
  opacity: 0.5;
}

.contrast-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contrast-score {
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 12px;
}

.contrast-score h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.score-value {
  font-size: 3.5rem;
  font-weight: bold;
  margin: 1rem 0;
}

.score-value.excellent {
  color: #38a169;
}

.score-value.good {
  color: #3182ce;
}

.score-value.warning {
  color: #d69e2e;
}

.score-value.error {
  color: #e53e3e;
}

.score-description {
  color: #718096;
  font-size: 1.1rem;
}

.wcag-compliance {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wcag-compliance h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.compliance-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.2s;
}

.compliance-item.pass {
  background: #f0fff4;
  border-left: 4px solid #38a169;
}

.compliance-item:not(.pass) {
  border-left: 4px solid #e53e3e;
}

.compliance-icon {
  font-size: 1.5rem;
  min-width: 40px;
  text-align: center;
}

.compliance-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.compliance-label {
  font-weight: 600;
  color: #2d3748;
}

.compliance-status {
  font-weight: 500;
}

.compliance-item.pass .compliance-status {
  color: #38a169;
}

.compliance-item:not(.pass) .compliance-status {
  color: #e53e3e;
}

.compliance-requirement {
  color: #718096;
  font-size: 0.9rem;
}

.compliance-summary {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.compliance-summary h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.rating-badge {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rating-badge.aaa {
  background: linear-gradient(135deg, #38a169 0%, #68d391 100%);
  color: white;
}

.rating-badge.aa {
  background: linear-gradient(135deg, #3182ce 0%, #63b3ed 100%);
  color: white;
}

.rating-badge.insufficient {
  background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%);
  color: white;
}

/* Стили для подбора акцентных цветов */
.accent-colors {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.accent-colors h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.accent-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.control-group label {
  font-weight: 600;
  color: #4a5568;
}

.contrast-slider {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, #e53e3e, #d69e2e, #38a169);
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.slider-value {
  text-align: center;
  font-weight: bold;
  color: #667eea;
  font-size: 1.1rem;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #718096;
}

.direction-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.direction-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 100px;
}

.direction-btn:hover {
  border-color: #667eea;
}

.direction-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.find-btn {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.2s;
  align-self: flex-end;
}

.find-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.accent-results {
  margin-top: 2rem;
}

.results-info {
  color: #718096;
  margin-bottom: 1.5rem;
}

.accent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.accent-color {
  height: 140px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.accent-color:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.accent-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.75rem;
  font-size: 0.85rem;
}

.accent-hex {
  display: block;
  font-family: monospace;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.accent-contrast {
  display: block;
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.accent-rating {
  display: block;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.accent-rating.aaa {
  color: #68d391;
}

.accent-rating.aa {
  color: #f6e05e;
}

.accent-rating.недостаточно {
  color: #fc8181;
}

.accent-copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.accent-copy-btn:hover {
  background: white;
  transform: scale(1.1);
}

/* Стили для рекомендаций */
.recommendations {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.recommendations h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.recommendation-card {
  padding: 2rem;
  border-radius: 12px;
  border-left: 6px solid;
}

.recommendation-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.recommendation-card p {
  margin: 0 0 1rem 0;
  color: #4a5568;
  line-height: 1.6;
  font-size: 1.1rem;
}

.recommendation-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #4a5568;
}

.recommendation-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.recommendation-card.error {
  background: #fff5f5;
  border-left-color: #fc8181;
}

.recommendation-card.warning {
  background: #fffaf0;
  border-left-color: #f6ad55;
}

.recommendation-card.good {
  background: #f0fff4;
  border-left-color: #68d391;
}

.recommendation-card.excellent {
  background: #ebf8ff;
  border-left-color: #63b3ed;
}

/* Стили для цветового круга */
.color-wheel-section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.color-wheel-section h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.section-description {
  color: #718096;
  margin-bottom: 1.5rem;
}

.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.color-wheel-canvas {
  width: 100%;
  max-width: 400px;
  height: 400px;
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 4px solid white;
}

.wheel-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.9rem;
}

.legend-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.wheel-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.info-text {
  flex: 1;
  color: #4a5568;
}

/* Адаптивность */
@media (max-width: 768px) {
  .accessibility-view {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .color-pickers {
    grid-template-columns: 1fr;
  }
  
  .accent-controls {
    grid-template-columns: 1fr;
  }
  
  .accent-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .color-wheel-canvas {
    max-width: 300px;
    height: 300px;
  }
}

@media (max-width: 480px) {
  .accent-grid {
    grid-template-columns: 1fr;
  }
  
  .direction-buttons {
    flex-direction: column;
  }
  
  .color-wheel-canvas {
    max-width: 250px;
    height: 250px;
  }
}
</style>