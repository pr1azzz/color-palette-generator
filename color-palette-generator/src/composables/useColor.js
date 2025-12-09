import { ref, computed } from 'vue'

// Генерация случайного цвета в HEX формате
export function generateRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

// Конвертация HEX в RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Форматирование цвета для отображения
export function formatColor(hex, format = 'hex') {
  if (format === 'hex') {
    return hex
  }
  
  const rgb = hexToRgb(hex)
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

// Генерация гармоничной палитры
export function generatePalette(count = 5, lockedColors = []) {
  const palette = [...lockedColors]
  
  // Генерируем базовый цвет
  const baseColor = generateRandomColor()
  const baseHsl = hexToHsl(baseColor)
  
  // Генерируем гармоничные цвета на основе цветового круга
  for (let i = palette.length; i < count; i++) {
    const hue = (baseHsl.h + (i * 360 / count)) % 360
    const saturation = 60 + Math.random() * 30
    const lightness = 40 + Math.random() * 30
    
    const color = hslToHex(hue, saturation, lightness)
    
    palette.push({
      hex: color,
      rgb: formatColor(color, 'rgb'),
      locked: false,
      id: Date.now() + i
    })
  }
  
  return palette
}

// Вспомогательные функции для конвертации
function hexToHsl(hex) {
  const rgb = hexToRgb(hex)
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

function hslToHex(h, s, l) {
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

// Получение контрастного цвета для текста
export function getContrastColor(hexColor) {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'
  
  // Формула яркости (luminance)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}