<template>
  <div class="home-view">
    <div class="hero">
      <h1>🎨 Генератор цветовых палитр</h1>
      <p>Создавайте, сохраняйте и экспортируйте гармоничные цветовые схемы</p>
      
      <div class="hero-actions">
        <router-link to="/generator" class="btn btn-primary">
          🚀 Начать генерацию
        </router-link>
        <router-link to="/library" class="btn btn-secondary">
          📚 Моя библиотека
        </router-link>
      </div>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">🎲</div>
        <h3>Генерация палитр</h3>
        <p>Создавайте случайные гармоничные палитры или на основе выбранного цвета</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Управление цветами</h3>
        <p>Закрепляйте понравившиеся цвета, копируйте значения в буфер обмена</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Анализ доступности</h3>
        <p>Проверяйте контрастность по стандарту WCAG AA/AAA</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">💾</div>
        <h3>Библиотека палитр</h3>
        <p>Сохраняйте, организуйте и редактируйте коллекции палитр</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  margin-bottom: 60px;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 30px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-secondary {
  background: transparent;
  border: 2px solid white;
  color: white;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin-bottom: 15px;
  color: #333;
}
</style>