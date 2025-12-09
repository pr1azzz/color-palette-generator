import { ref } from 'vue'

export function useColorApi() {
  const isLoading = ref(false)
  const error = ref(null)
  
  // Конвертация цветов через внешний API
  const convertColors = async (colors, format) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Используем colormind API для генерации палитр
      const response = await fetch('http://colormind.io/api/', {
        method: 'POST',
        body: JSON.stringify({
          model: 'default',
          input: colors.map(color => [color.r, color.g, color.b])
        })
      })
      
      const data = await response.json()
      return data.result.map(rgb => ({
        hex: rgbToHex(rgb[0], rgb[1], rgb[2]),
        rgb: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
      }))
    } catch (err) {
      error.value = 'Ошибка при конвертации цветов'
      console.error('Color API error:', err)
      return colors // Возвращаем исходные цвета при ошибке
    } finally {
      isLoading.value = false
    }
  }
  
  // Получение названия цвета по HEX
  const getColorName = async (hex) => {
    try {
      const response = await fetch(`https://api.color.pizza/v1/${hex.replace('#', '')}`)
      const data = await response.json()
      return data.colors?.[0]?.name || 'Неизвестный цвет'
    } catch {
      return 'Неизвестный цвет'
    }
  }
  
  // RGB в HEX
  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }
  
  return {
    isLoading,
    error,
    convertColors,
    getColorName
  }
}