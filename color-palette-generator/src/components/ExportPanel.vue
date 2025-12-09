<template>
  <div class="export-panel">
    <h3>📤 Экспорт палитры</h3>
    
    <div class="palette-preview">
      <div 
        v-for="color in palette" 
        :key="color.id"
        class="export-color"
        :style="{ backgroundColor: color.hex }"
      >
        <span class="color-hex">{{ color.hex }}</span>
      </div>
    </div>
    
    <div class="export-formats">
      <div class="format-group">
        <label>
          <input type="radio" v-model="exportFormat" value="css" />
          CSS Variables
        </label>
        <label>
          <input type="radio" v-model="exportFormat" value="scss" />
          SCSS Variables
        </label>
        <label>
          <input type="radio" v-model="exportFormat" value="tailwind" />
          Tailwind Config
        </label>
        <label>
          <input type="radio" v-model="exportFormat" value="json" />
          JSON
        </label>
      </div>
    </div>
    
    <div class="export-code">
      <h4>Код для экспорта:</h4>
      <pre><code>{{ generatedCode }}</code></pre>
      <div class="export-actions">
        <button @click="copyCode" class="copy-btn">
          📋 Копировать код
        </button>
        <button @click="downloadCode" class="download-btn">
          ⬇️ Скачать файл
        </button>
        <button @click="generateShareLink" class="share-btn">
          🔗 Поделиться ссылкой
        </button>
      </div>
    </div>
    
    <!-- UI компоненты для превью -->
    <div class="ui-preview">
      <h4>👁️ Превью в UI-компонентах</h4>
      <div class="ui-examples">
        <div class="ui-button" :style="{ backgroundColor: primaryColor }">
          Кнопка
        </div>
        <div class="ui-card" :style="{ borderColor: secondaryColor }">
          Карточка
        </div>
        <div class="ui-alert" :style="{ backgroundColor: accentColor }">
          Уведомление
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ExportPanel',
  props: {
    palette: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const exportFormat = ref('css')
    
    // Основные цвета из палитры
    const primaryColor = computed(() => 
      props.palette[0]?.hex || '#667eea'
    )
    
    const secondaryColor = computed(() => 
      props.palette[1]?.hex || '#764ba2'
    )
    
    const accentColor = computed(() => 
      props.palette[2]?.hex || '#f093fb'
    )
    
    // Генерация кода в зависимости от формата
    const generatedCode = computed(() => {
      switch (exportFormat.value) {
        case 'css':
          return generateCssVariables()
        case 'scss':
          return generateScssVariables()
        case 'tailwind':
          return generateTailwindConfig()
        case 'json':
          return generateJson()
        default:
          return ''
      }
    })
    
    const generateCssVariables = () => {
      let code = ':root {\n'
      props.palette.forEach((color, index) => {
        code += `  --color-primary-${index + 1}: ${color.hex};\n`
        code += `  --color-primary-${index + 1}-rgb: ${color.hex.replace('#', '').match(/.{2}/g)?.join(', ') || '0, 0, 0'};\n`
      })
      code += '}'
      return code
    }
    
    const generateScssVariables = () => {
      let code = ''
      props.palette.forEach((color, index) => {
        code += `$color-primary-${index + 1}: ${color.hex};\n`
      })
      return code
    }
    
    const generateTailwindConfig = () => {
      let code = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n'
      props.palette.forEach((color, index) => {
        code += `        'primary-${index + 1}': '${color.hex}',\n`
      })
      code += '      }\n    }\n  }\n}'
      return code
    }
    
    const generateJson = () => {
      return JSON.stringify({
        palette: props.palette,
        generatedAt: new Date().toISOString(),
        format: 'color-palette'
      }, null, 2)
    }
    
    const copyCode = async () => {
      await navigator.clipboard.writeText(generatedCode.value)
      alert('Код скопирован в буфер обмена!')
    }
    
    const downloadCode = () => {
      const blob = new Blob([generatedCode.value], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const extension = exportFormat.value === 'json' ? 'json' : exportFormat.value
      a.href = url
      a.download = `palette.${extension}`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    const generateShareLink = () => {
      const colors = props.palette.map(c => c.hex.replace('#', '')).join('-')
      const link = `${window.location.origin}/share/${colors}`
      alert(`Ссылка для шаринга: ${link}`)
    }
    
    return {
      exportFormat,
      generatedCode,
      primaryColor,
      secondaryColor,
      accentColor,
      copyCode,
      downloadCode,
      generateShareLink
    }
  }
}
</script>

<style scoped>
.export-panel {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.export-panel h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.palette-preview {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.export-color {
  flex: 1;
  height: 50px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.color-hex {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem;
  font-size: 0.8rem;
  font-family: monospace;
  text-align: center;
}

.export-formats {
  margin-bottom: 1.5rem;
}

.format-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.format-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.format-group label:hover {
  border-color: #667eea;
}

.export-code {
  margin-bottom: 1.5rem;
}

.export-code h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.export-code pre {
  background: #1a202c;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.export-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.copy-btn,
.download-btn,
.share-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  flex: 1;
  min-width: 120px;
}

.copy-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.download-btn {
  background: #c6f6d5;
  color: #276749;
}

.share-btn {
  background: #bee3f8;
  color: #2c5282;
}

.copy-btn:hover,
.download-btn:hover,
.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.ui-preview {
  border-top: 2px solid #e2e8f0;
  padding-top: 1.5rem;
}

.ui-preview h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.ui-examples {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.ui-button,
.ui-card,
.ui-alert {
  flex: 1;
  min-width: 150px;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  transition: transform 0.2s;
}

.ui-button:hover,
.ui-card:hover,
.ui-alert:hover {
  transform: translateY(-5px);
}

.ui-button {
  color: white;
  cursor: pointer;
}

.ui-card {
  border: 2px solid;
  background: white;
  color: #2d3748;
}

.ui-alert {
  color: white;
}
</style>