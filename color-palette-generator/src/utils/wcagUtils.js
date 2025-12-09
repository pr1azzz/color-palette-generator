// Расчет относительной яркости цвета
export function calculateLuminance(hexColor) {
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

// Расчет контрастности между двумя цветами
export function calculateContrast(color1, color2) {
  const lum1 = calculateLuminance(color1)
  const lum2 = calculateLuminance(color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Проверка соответствия стандартам WCAG
export function checkWCAGCompliance(color1, color2) {
  const contrast = calculateContrast(color1, color2)
  
  return {
    contrast: Math.round(contrast * 100) / 100,
    passesAA: contrast >= 4.5,
    passesAAA: contrast >= 7,
    passesAALarge: contrast >= 3,
    passesAAALarge: contrast >= 4.5,
    rating: contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'Недостаточно'
  }
}

// Вспомогательная функция
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}