<template>
  <div class="library-view">
    <div class="header">
      <h1>📚 Библиотека палитр</h1>
      <p class="subtitle">Управляйте своими коллекциями цветов</p>
    </div>

    <!-- Поиск и фильтрация -->
    <div class="search-filters">
      <div class="search-bar">
        <div class="search-input-group">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск по названию, тегам или цветам..."
            class="search-input"
          />
          <button @click="clearSearch" class="clear-search-btn" v-if="searchQuery">
            ×
          </button>
        </div>
        <button @click="toggleFilters" class="filter-toggle-btn">
          {{ showFilters ? 'Скрыть фильтры' : 'Показать фильтры' }}
        </button>
      </div>
      
      <!-- Расширенные фильтры -->
      <div v-if="showFilters" class="filters-panel">
        <div class="filter-group">
          <label>Тип палитры:</label>
          <select v-model="filterType" class="filter-select">
            <option value="">Все типы</option>
            <option value="analogous">Аналогичная</option>
            <option value="monochromatic">Монохромная</option>
            <option value="triadic">Триада</option>
            <option value="complementary">Комплементарная</option>
            <option value="custom">Пользовательская</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Количество цветов:</label>
          <div class="color-count-filter">
            <button 
              v-for="count in [3, 5, 7, 0]" 
              :key="count"
              @click="filterCount = count"
              :class="{ active: filterCount === count }"
              class="count-btn"
            >
              {{ count === 0 ? 'Любое' : count }}
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Сортировка:</label>
          <select v-model="sortBy" class="filter-select">
            <option value="date">По дате создания</option>
            <option value="name">По названию</option>
            <option value="colors">По количеству цветов</option>
            <option value="updated">По дате обновления</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Теги:</label>
          <div class="tags-filter">
            <div 
              v-for="tag in availableTags" 
              :key="tag"
              @click="toggleTagFilter(tag)"
              :class="{ active: filterTags.includes(tag) }"
              class="tag-filter"
            >
              {{ tag }}
            </div>
          </div>
        </div>
        
        <div class="filter-actions">
          <button @click="applyFilters" class="apply-filters-btn">
            Применить фильтры
          </button>
          <button @click="resetFilters" class="reset-filters-btn">
            Сбросить все
          </button>
        </div>
      </div>
    </div>

    <!-- Основной контент библиотеки -->
    <div class="library-content">
      <!-- Избранные коллекции -->
      <div v-if="favoriteCollections.length > 0" class="favorites-section">
        <div class="section-header">
          <h2>⭐ Избранные коллекции</h2>
          <span class="section-badge">{{ favoriteCollections.length }}</span>
        </div>
        
        <div class="collections-grid">
          <div 
            v-for="collection in favoriteCollections" 
            :key="collection.id"
            class="collection-card favorite"
            @click="openCollection(collection)"
          >
            <div class="collection-colors">
              <div 
                v-for="color in getCollectionColors(collection)" 
                :key="color"
                class="collection-color"
                :style="{ backgroundColor: color }"
                :title="color"
              ></div>
            </div>
            <div class="collection-info">
              <div class="collection-header">
                <h3>{{ collection.name }}</h3>
                <button 
                  @click.stop="toggleFavorite(collection.id)"
                  class="favorite-btn active"
                  title="Убрать из избранного"
                >
                  ⭐
                </button>
              </div>
              <p class="collection-description">{{ collection.description || 'Без описания' }}</p>
              <div class="collection-meta">
                <span class="meta-item">
                  🎨 {{ collection.palette?.length || 0 }} цветов
                </span>
                <span class="meta-item">
                  📅 {{ formatDate(collection.createdAt) }}
                </span>
              </div>
              <div class="collection-tags">
                <span 
                  v-for="tag in collection.tags.slice(0, 3)" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
                <span v-if="collection.tags.length > 3" class="tag more">
                  +{{ collection.tags.length - 3 }}
                </span>
              </div>
            </div>
            <div class="collection-actions">
              <button @click.stop="editCollection(collection)" class="action-btn" title="Редактировать">
                ✏️
              </button>
              <button @click.stop="exportCollection(collection)" class="action-btn" title="Экспорт">
                📤
              </button>
              <button @click.stop="duplicateCollection(collection)" class="action-btn" title="Дублировать">
                📋
              </button>
              <button @click.stop="deleteCollection(collection.id)" class="action-btn delete" title="Удалить">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Все коллекции -->
      <div class="collections-section">
        <div class="section-header">
          <h2>Все коллекции</h2>
          <div class="section-actions">
            <button @click="createNewCollection" class="create-btn">
              + Новая коллекция
            </button>
            <button @click="importCollection" class="import-btn">
              📥 Импорт
            </button>
          </div>
        </div>
        
        <div v-if="filteredCollections.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>Коллекций не найдено</h3>
          <p v-if="hasActiveFilters">
            Попробуйте изменить параметры поиска или сбросить фильтры
          </p>
          <p v-else>
            Создайте свою первую коллекцию палитр
          </p>
          <button @click="createNewCollection" class="btn btn-primary">
            Создать коллекцию
          </button>
          <button @click="resetFilters" class="btn" v-if="hasActiveFilters">
            Сбросить фильтры
          </button>
        </div>
        
        <div v-else class="collections-grid">
          <div 
            v-for="collection in filteredCollections" 
            :key="collection.id"
            class="collection-card"
            @click="openCollection(collection)"
          >
            <div class="collection-colors">
              <div 
                v-for="color in getCollectionColors(collection)" 
                :key="color"
                class="collection-color"
                :style="{ backgroundColor: color }"
                :title="color"
              ></div>
            </div>
            <div class="collection-info">
              <div class="collection-header">
                <h3>{{ collection.name }}</h3>
                <button 
                  @click.stop="toggleFavorite(collection.id)"
                  class="favorite-btn"
                  :class="{ active: isFavorite(collection.id) }"
                  :title="isFavorite(collection.id) ? 'Убрать из избранного' : 'Добавить в избранное'"
                >
                  {{ isFavorite(collection.id) ? '⭐' : '☆' }}
                </button>
              </div>
              <p class="collection-description">{{ collection.description || 'Без описания' }}</p>
              <div class="collection-meta">
                <span class="meta-item">
                  🎨 {{ collection.palette?.length || 0 }} цветов
                </span>
                <span class="meta-item">
                  📅 {{ formatDate(collection.updatedAt || collection.createdAt) }}
                </span>
                <span class="meta-item">
                  {{ collection.type || 'Пользовательская' }}
                </span>
              </div>
              <div class="collection-tags">
                <span 
                  v-for="tag in collection.tags.slice(0, 3)" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
                <span v-if="collection.tags.length > 3" class="tag more">
                  +{{ collection.tags.length - 3 }}
                </span>
              </div>
            </div>
            <div class="collection-actions">
              <button @click.stop="editCollection(collection)" class="action-btn" title="Редактировать">
                ✏️
              </button>
              <button @click.stop="exportCollection(collection)" class="action-btn" title="Экспорт">
                📤
              </button>
              <button @click.stop="duplicateCollection(collection)" class="action-btn" title="Дублировать">
                📋
              </button>
              <button @click.stop="deleteCollection(collection.id)" class="action-btn delete" title="Удалить">
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <!-- Пагинация -->
        <div v-if="filteredCollections.length > itemsPerPage" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ←
          </button>
          
          <div class="page-numbers">
            <span 
              v-for="page in totalPages" 
              :key="page"
              @click="currentPage = page"
              :class="{ active: page === currentPage }"
              class="page-number"
            >
              {{ page }}
            </span>
          </div>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            →
          </button>
        </div>
      </div>

      <!-- Боковая панель для работы с коллекцией -->
      <div v-if="selectedCollection" class="collection-sidebar">
        <div class="sidebar-header">
          <h3>{{ selectedCollection.name }}</h3>
          <button @click="selectedCollection = null" class="close-sidebar-btn">
            ×
          </button>
        </div>
        
        <div class="sidebar-content">
          <!-- Информация о коллекции -->
          <div class="collection-details">
            <h4>Информация</h4>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Дата создания:</span>
                <span class="detail-value">{{ formatDate(selectedCollection.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Последнее обновление:</span>
                <span class="detail-value">{{ formatDate(selectedCollection.updatedAt || selectedCollection.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Тип палитры:</span>
                <span class="detail-value">{{ selectedCollection.type || 'Пользовательская' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Количество цветов:</span>
                <span class="detail-value">{{ getCollectionColors(selectedCollection).length }}</span>
              </div>
            </div>
          </div>
          
          <!-- Цвета коллекции -->
          <div class="collection-palette">
            <h4>Цвета палитры</h4>
            <div class="palette-colors">
              <div 
                v-for="(color, index) in getCollectionColors(selectedCollection)" 
                :key="index"
                class="palette-color"
                :style="{ backgroundColor: color }"
                @click="copyColor(color)"
              >
                <span class="color-hex">{{ color }}</span>
                <button @click.stop="removeColorFromCollection(index)" class="remove-color-btn">
                  ×
                </button>
              </div>
              <button @click="addColorToCollection" class="add-color-btn">
                + Добавить цвет
              </button>
            </div>
          </div>
          
          <!-- Экспорт -->
          <div class="collection-export">
            <h4>Экспорт</h4>
            <div class="export-options">
              <button @click="exportAsCss" class="export-option">
                CSS
              </button>
              <button @click="exportAsScss" class="export-option">
                SCSS
              </button>
              <button @click="exportAsJson" class="export-option">
                JSON
              </button>
              <button @click="exportAsTailwind" class="export-option">
                Tailwind
              </button>
              <button @click="shareCollection" class="export-option share">
                🔗 Поделиться
              </button>
            </div>
          </div>
          
          <!-- Быстрые действия -->
          <div class="quick-actions">
            <h4>Действия</h4>
            <div class="action-buttons">
              <button @click="editSelectedCollection" class="action-button">
                ✏️ Редактировать
              </button>
              <button @click="duplicateSelectedCollection" class="action-button">
                📋 Дублировать
              </button>
              <button @click="toggleFavorite(selectedCollection.id)" class="action-button">
                {{ isFavorite(selectedCollection.id) ? '☆ Убрать из избранного' : '⭐ Добавить в избранное' }}
              </button>
              <button @click="generatePreview" class="action-button">
                👁️ Превью
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования коллекции -->
    <div v-if="showCollectionModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingCollection ? 'Редактирование коллекции' : 'Новая коллекция' }}</h3>
          <button @click="showCollectionModal = false" class="close-modal-btn">
            ×
          </button>
        </div>
        
        <div class="modal-content">
          <div class="form-group">
            <label>Название коллекции *</label>
            <input 
              v-model="collectionForm.name" 
              type="text" 
              placeholder="Моя коллекция"
              :class="{ error: !collectionForm.name.trim() }"
            />
          </div>
          
          <div class="form-group">
            <label>Описание</label>
            <textarea 
              v-model="collectionForm.description" 
              rows="3" 
              placeholder="Описание коллекции..."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Тип палитры</label>
            <select v-model="collectionForm.type" class="type-select">
              <option value="custom">Пользовательская</option>
              <option value="analogous">Аналогичная</option>
              <option value="monochromatic">Монохромная</option>
              <option value="triadic">Триада</option>
              <option value="complementary">Комплементарная</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Теги</label>
            <div class="tags-input">
              <input 
                v-model="tagInput" 
                @keyup.enter="addTag" 
                @keyup.delete="removeLastTag"
                placeholder="Введите тег и нажмите Enter"
                type="text"
              />
              <div class="tags-list">
                <span 
                  v-for="tag in collectionForm.tags" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                  <button @click="removeTag(tag)" class="remove-tag-btn">
                    ×
                  </button>
                </span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Цвета палитры</label>
            <div class="colors-editor">
              <div 
                v-for="(color, index) in collectionForm.colors" 
                :key="index"
                class="color-editor"
              >
                <input 
                  v-model="collectionForm.colors[index]" 
                  type="color" 
                  class="color-picker"
                />
                <input 
                  v-model="collectionForm.colors[index]" 
                  type="text" 
                  class="color-input"
                  placeholder="#000000"
                />
                <button 
                  @click="removeColor(index)" 
                  class="remove-color-btn"
                  :disabled="collectionForm.colors.length <= 1"
                >
                  ×
                </button>
              </div>
              <button @click="addColor" class="add-color-btn">
                + Добавить цвет
              </button>
            </div>
          </div>
          
          <div class="color-preview">
            <h4>Предпросмотр:</h4>
            <div class="preview-colors">
              <div 
                v-for="(color, index) in collectionForm.colors" 
                :key="index"
                class="preview-color"
                :style="{ backgroundColor: color }"
                :title="color"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showCollectionModal = false" class="cancel-btn">
            Отмена
          </button>
          <button 
            @click="saveCollection" 
            class="save-btn"
            :disabled="!collectionForm.name.trim()"
          >
            {{ editingCollection ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно импорта -->
    <div v-if="showImportModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Импорт коллекции</h3>
          <button @click="showImportModal = false" class="close-modal-btn">
            ×
          </button>
        </div>
        
        <div class="modal-content">
          <div class="import-options">
            <div class="import-option">
              <h4>Из JSON файла</h4>
              <input 
                type="file" 
                accept=".json" 
                @change="importFromJson"
                class="file-input"
              />
              <p class="help-text">Поддерживается формат экспорта Palette Generator</p>
            </div>
            
            <div class="import-option">
              <h4>Из текста (JSON)</h4>
              <textarea 
                v-model="importJsonText" 
                rows="6" 
                placeholder='{"name": "Моя коллекция", "colors": ["#000000", "#ffffff"]}'
                class="json-input"
              ></textarea>
              <button 
                @click="importFromJsonText" 
                :disabled="!importJsonText.trim()"
                class="import-btn"
              >
                Импортировать
              </button>
            </div>
            
            <div class="import-option">
              <h4>Из URL</h4>
              <input 
                v-model="importUrl" 
                type="text" 
                placeholder="https://example.com/palette.json"
                class="url-input"
              />
              <button 
                @click="importFromUrl" 
                :disabled="!importUrl.trim()"
                class="import-btn"
              >
                Загрузить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно превью -->
    <div v-if="showPreviewModal" class="modal-overlay preview-modal">
      <div class="modal preview-modal-content">
        <div class="modal-header">
          <h3>Превью палитры</h3>
          <button @click="showPreviewModal = false" class="close-modal-btn">
            ×
          </button>
        </div>
        
        <div class="preview-content">
          <div class="preview-palette">
            <div 
              v-for="(color, index) in previewColors" 
              :key="index"
              class="preview-color-big"
              :style="{ backgroundColor: color }"
            >
              <span class="color-hex-big">{{ color }}</span>
            </div>
          </div>
          
          <div class="preview-ui">
            <div class="ui-example">
              <div class="ui-header" :style="{ backgroundColor: previewColors[0] }">
                <h4>Заголовок</h4>
                <button :style="{ backgroundColor: previewColors[1], color: getContrastColor(previewColors[1]) }">
                  Кнопка
                </button>
              </div>
              <div class="ui-body">
                <div 
                  class="ui-card" 
                  :style="{ borderColor: previewColors[2], backgroundColor: getLightColor(previewColors[2]) }"
                >
                  <h5>Карточка</h5>
                  <p>Пример контента с использованием цветов палитры</p>
                </div>
                <div 
                  class="ui-alert" 
                  :style="{ backgroundColor: previewColors[3], color: getContrastColor(previewColors[3]) }"
                >
                  Уведомление
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Уведомления -->
    <transition name="fade">
      <div v-if="showNotification" class="notification">
        <div class="notification-content">
          <span class="notification-icon">{{ notificationIcon }}</span>
          <span class="notification-text">{{ notificationText }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'LibraryView',
  setup() {
    // ========== РЕАКТИВНЫЕ ДАННЫЕ ==========
    
    // Основные данные
    const collections = ref([])
    const favoriteCollections = ref([])
    const selectedCollection = ref(null)
    
    // Поиск и фильтрация
    const searchQuery = ref('')
    const showFilters = ref(false)
    const filterType = ref('')
    const filterCount = ref(0)
    const filterTags = ref([])
    const sortBy = ref('date')
    
    // Пагинация
    const currentPage = ref(1)
    const itemsPerPage = 12
    
    // Модальные окна
    const showCollectionModal = ref(false)
    const showImportModal = ref(false)
    const showPreviewModal = ref(false)
    
    // Формы
    const editingCollection = ref(null)
    const collectionForm = ref({
      name: '',
      description: '',
      type: 'custom',
      tags: [],
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4fd1c5']
    })
    
    // Импорт
    const tagInput = ref('')
    const importJsonText = ref('')
    const importUrl = ref('')
    
    // Превью
    const previewColors = ref([])
    
    // Уведомления
    const showNotification = ref(false)
    const notificationText = ref('')
    const notificationIcon = ref('✅')
    
    // ========== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ==========
    
    // Доступные теги из всех коллекций
    const availableTags = computed(() => {
      const tags = new Set()
      collections.value.forEach(collection => {
        collection.tags?.forEach(tag => tags.add(tag))
      })
      return Array.from(tags).sort()
    })
    
    // Есть ли активные фильтры
    const hasActiveFilters = computed(() => {
      return searchQuery.value || filterType.value || filterCount.value > 0 || filterTags.value.length > 0
    })
    
    // Отфильтрованные коллекции
    const filteredCollections = computed(() => {
      let filtered = collections.value
      
      // Фильтрация по поисковому запросу
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(collection => 
          collection.name.toLowerCase().includes(query) ||
          collection.description?.toLowerCase().includes(query) ||
          collection.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          collection.colors?.some(color => color.toLowerCase().includes(query))
        )
      }
      
      // Фильтрация по типу
      if (filterType.value) {
        filtered = filtered.filter(collection => collection.type === filterType.value)
      }
      
      // Фильтрация по количеству цветов
      if (filterCount.value > 0) {
        filtered = filtered.filter(collection => 
          getCollectionColors(collection).length === filterCount.value
        )
      }
      
      // Фильтрация по тегам
      if (filterTags.value.length > 0) {
        filtered = filtered.filter(collection => 
          filterTags.value.every(tag => collection.tags?.includes(tag))
        )
      }
      
      // Исключаем избранные из основного списка
      const favoriteIds = new Set(favoriteCollections.value.map(f => f.id))
      filtered = filtered.filter(collection => !favoriteIds.has(collection.id))
      
      // Сортировка
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'colors':
            return getCollectionColors(b).length - getCollectionColors(a).length
          case 'updated':
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
          default: // date
            return new Date(b.createdAt) - new Date(a.createdAt)
        }
      })
      
      return filtered
    })
    
    // Пагинированные коллекции
    const paginatedCollections = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredCollections.value.slice(start, end)
    })
    
    // Общее количество страниц
    const totalPages = computed(() => {
      return Math.ceil(filteredCollections.value.length / itemsPerPage)
    })
    
    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С КОЛЛЕКЦИЯМИ ==========
    
    // Загрузка данных
    const loadData = () => {
      const savedCollections = localStorage.getItem('paletteCollections')
      const savedFavorites = localStorage.getItem('favoriteCollections')
      
      if (savedCollections) {
        try {
          collections.value = JSON.parse(savedCollections)
        } catch (e) {
          console.error('Ошибка загрузки коллекций:', e)
          collections.value = []
        }
      }
      
      if (savedFavorites) {
        try {
          favoriteCollections.value = JSON.parse(savedFavorites)
        } catch (e) {
          console.error('Ошибка загрузки избранных:', e)
          favoriteCollections.value = []
        }
      }
    }
    
    // Сохранение данных
    const saveData = () => {
      localStorage.setItem('paletteCollections', JSON.stringify(collections.value))
      localStorage.setItem('favoriteCollections', JSON.stringify(favoriteCollections.value))
    }
    
    // Получение цветов из коллекции
    const getCollectionColors = (collection) => {
      if (Array.isArray(collection.palette)) {
        return collection.palette.map(color => color.hex || color)
      }
      if (Array.isArray(collection.colors)) {
        return collection.colors
      }
      return []
    }
    
    // Проверка, является ли коллекция избранной
    const isFavorite = (collectionId) => {
      return favoriteCollections.value.some(f => f.id === collectionId)
    }
    
    // Переключение избранного
    const toggleFavorite = (collectionId) => {
      const collection = collections.value.find(c => c.id === collectionId)
      if (!collection) return
      
      const favIndex = favoriteCollections.value.findIndex(f => f.id === collectionId)
      
      if (favIndex === -1) {
        favoriteCollections.value.push(collection)
        showNotificationMessage('⭐ Коллекция добавлена в избранное')
      } else {
        favoriteCollections.value.splice(favIndex, 1)
        showNotificationMessage('☆ Коллекция удалена из избранного')
      }
      
      saveData()
    }
    
    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С ФОРМАМИ ==========
    
    // Создание новой коллекции
    const createNewCollection = () => {
      editingCollection.value = null
      collectionForm.value = {
        name: '',
        description: '',
        type: 'custom',
        tags: [],
        colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4fd1c5']
      }
      tagInput.value = ''
      showCollectionModal.value = true
    }
    
    // Редактирование коллекции
    const editCollection = (collection) => {
      editingCollection.value = collection
      collectionForm.value = {
        name: collection.name,
        description: collection.description || '',
        type: collection.type || 'custom',
        tags: [...(collection.tags || [])],
        colors: getCollectionColors(collection)
      }
      tagInput.value = ''
      showCollectionModal.value = true
    }
    
    // Редактирование выбранной коллекции
    const editSelectedCollection = () => {
      if (selectedCollection.value) {
        editCollection(selectedCollection.value)
      }
    }
    
    // Добавление тега
    const addTag = () => {
      const tag = tagInput.value.trim()
      if (tag && !collectionForm.value.tags.includes(tag)) {
        collectionForm.value.tags.push(tag)
        tagInput.value = ''
      }
    }
    
    // Удаление тега
    const removeTag = (tagToRemove) => {
      collectionForm.value.tags = collectionForm.value.tags.filter(tag => tag !== tagToRemove)
    }
    
    // Удаление последнего тега
    const removeLastTag = () => {
      if (tagInput.value === '' && collectionForm.value.tags.length > 0) {
        collectionForm.value.tags.pop()
      }
    }
    
    // Добавление цвета
    const addColor = () => {
      collectionForm.value.colors.push('#ffffff')
    }
    
    // Удаление цвета
    const removeColor = (index) => {
      if (collectionForm.value.colors.length > 1) {
        collectionForm.value.colors.splice(index, 1)
      }
    }
    
    // Сохранение коллекции
    const saveCollection = () => {
      if (!collectionForm.value.name.trim()) {
        showNotificationMessage('❌ Введите название коллекции', 'error')
        return
      }
      
      const collectionData = {
        id: editingCollection.value?.id || Date.now(),
        name: collectionForm.value.name.trim(),
        description: collectionForm.value.description.trim(),
        type: collectionForm.value.type,
        tags: collectionForm.value.tags,
        palette: collectionForm.value.colors.map(hex => ({ hex })),
        createdAt: editingCollection.value?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      if (editingCollection.value) {
        const index = collections.value.findIndex(c => c.id === editingCollection.value.id)
        if (index !== -1) {
          collections.value[index] = {
            ...collections.value[index],
            ...collectionData
          }
        }
        
        // Обновляем в избранных, если нужно
        const favIndex = favoriteCollections.value.findIndex(f => f.id === editingCollection.value.id)
        if (favIndex !== -1) {
          favoriteCollections.value[favIndex] = {
            ...favoriteCollections.value[favIndex],
            ...collectionData
          }
        }
        
        showNotificationMessage('✅ Коллекция обновлена')
      } else {
        collections.value.unshift(collectionData)
        showNotificationMessage('✅ Коллекция создана')
      }
      
      saveData()
      showCollectionModal.value = false
    }
    
    // ========== МЕТОДЫ ДЛЯ ДЕЙСТВИЙ С КОЛЛЕКЦИЯМИ ==========
    
    // Открытие коллекции
    const openCollection = (collection) => {
      selectedCollection.value = collection
    }
    
    // Дублирование коллекции
    const duplicateCollection = (collection) => {
      const duplicate = {
        ...collection,
        id: Date.now(),
        name: `${collection.name} (копия)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      collections.value.unshift(duplicate)
      saveData()
      showNotificationMessage('📋 Коллекция скопирована')
    }
    
    // Дублирование выбранной коллекции
    const duplicateSelectedCollection = () => {
      if (selectedCollection.value) {
        duplicateCollection(selectedCollection.value)
      }
    }
    
    // Удаление коллекции
    const deleteCollection = (collectionId) => {
      if (!confirm('Удалить коллекцию? Это действие нельзя отменить.')) {
        return
      }
      
      collections.value = collections.value.filter(c => c.id !== collectionId)
      favoriteCollections.value = favoriteCollections.value.filter(f => f.id !== collectionId)
      saveData()
      
      if (selectedCollection.value?.id === collectionId) {
        selectedCollection.value = null
      }
      
      showNotificationMessage('🗑️ Коллекция удалена')
    }
    
    // ========== МЕТОДЫ ДЛЯ ЭКСПОРТА ==========
    
    // Экспорт коллекции
    const exportCollection = (collection) => {
      const exportData = {
        name: collection.name,
        description: collection.description,
        type: collection.type,
        tags: collection.tags,
        colors: getCollectionColors(collection),
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        exportedAt: new Date().toISOString(),
        format: 'palette-library-v1'
      }
      
      const json = JSON.stringify(exportData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${collection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showNotificationMessage('📤 Коллекция экспортирована')
    }
    
    // Экспорт как CSS
    const exportAsCss = () => {
      if (!selectedCollection.value) return
      
      const colors = getCollectionColors(selectedCollection.value)
      let css = `/* ${selectedCollection.value.name} */\n:root {\n`
      
      colors.forEach((color, index) => {
        css += `  --color-${index + 1}: ${color};\n`
      })
      
      css += '}'
      
      const blob = new Blob([css], { type: 'text/css' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedCollection.value.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.css`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    // Экспорт как SCSS
    const exportAsScss = () => {
      if (!selectedCollection.value) return
      
      const colors = getCollectionColors(selectedCollection.value)
      let scss = `// ${selectedCollection.value.name}\n`
      
      colors.forEach((color, index) => {
        scss += `$color-${index + 1}: ${color};\n`
      })
      
      const blob = new Blob([scss], { type: 'text/x-scss' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedCollection.value.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.scss`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    // Экспорт как JSON
    const exportAsJson = () => {
      exportCollection(selectedCollection.value)
    }
    
    // Экспорт для Tailwind
    const exportAsTailwind = () => {
      if (!selectedCollection.value) return
      
      const colors = getCollectionColors(selectedCollection.value)
      let config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        'palette': {\n`
      
      colors.forEach((color, index) => {
        config += `          '${index + 1}': '${color}',\n`
      })
      
      config += '        }\n      }\n    }\n  }\n}'
      
      const blob = new Blob([config], { type: 'application/javascript' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `tailwind.config.js`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    // Поделиться коллекцией
    const shareCollection = () => {
      if (!selectedCollection.value) return
      
      const colors = getCollectionColors(selectedCollection.value)
      const hexColors = colors.map(color => color.replace('#', '')).join('-')
      const shareUrl = `${window.location.origin}/share/${hexColors}?name=${encodeURIComponent(selectedCollection.value.name)}`
      
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showNotificationMessage('🔗 Ссылка скопирована в буфер обмена')
        })
        .catch(() => {
          alert(`Ссылка для шаринга:\n${shareUrl}`)
        })
    }
    
    // ========== МЕТОДЫ ДЛЯ ИМПОРТА ==========
    
    // Импорт коллекции
    const importCollection = () => {
      showImportModal.value = true
      importJsonText.value = ''
      importUrl.value = ''
    }
    
    // Импорт из JSON файла
    const importFromJson = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          processImport(data)
          event.target.value = '' // Сбрасываем input
        } catch (error) {
          showNotificationMessage('❌ Ошибка чтения JSON файла', 'error')
          console.error('Import error:', error)
        }
      }
      reader.readAsText(file)
    }
    
    // Импорт из текста JSON
    const importFromJsonText = () => {
      try {
        const data = JSON.parse(importJsonText.value)
        processImport(data)
        importJsonText.value = ''
      } catch (error) {
        showNotificationMessage('❌ Неверный формат JSON', 'error')
      }
    }
    
    // Импорт из URL
    const importFromUrl = async () => {
      try {
        const response = await fetch(importUrl.value)
        const data = await response.json()
        processImport(data)
        importUrl.value = ''
      } catch (error) {
        showNotificationMessage('❌ Ошибка загрузки из URL', 'error')
      }
    }
    
    // Обработка импортированных данных
    const processImport = (data) => {
      let collectionData
      
      // Проверяем различные форматы
      if (data.palette && Array.isArray(data.palette)) {
        // Наш формат экспорта
        collectionData = data
      } else if (Array.isArray(data.colors)) {
        // Простой массив цветов
        collectionData = {
          name: data.name || 'Импортированная коллекция',
          colors: data.colors,
          tags: data.tags || ['импорт'],
          type: data.type || 'custom'
        }
      } else if (Array.isArray(data)) {
        // Просто массив цветов
        collectionData = {
          name: 'Импортированная коллекция',
          colors: data,
          tags: ['импорт'],
          type: 'custom'
        }
      } else {
        throw new Error('Неверный формат данных')
      }
      
      // Создаем новую коллекцию
      const newCollection = {
        id: Date.now(),
        name: collectionData.name || 'Импортированная коллекция',
        description: collectionData.description || '',
        type: collectionData.type || 'custom',
        tags: collectionData.tags || ['импорт'],
        palette: (collectionData.colors || collectionData.palette || []).map(color => 
          typeof color === 'string' ? { hex: color } : color
        ),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      collections.value.unshift(newCollection)
      saveData()
      showImportModal.value = false
      showNotificationMessage('📥 Коллекция импортирована')
    }
    
    // ========== МЕТОДЫ ДЛЯ ПРЕВЬЮ ==========
    
    // Генерация превью
    const generatePreview = () => {
      if (!selectedCollection.value) return
      
      previewColors.value = getCollectionColors(selectedCollection.value)
      showPreviewModal.value = true
    }
    
    // Получение контрастного цвета
    const getContrastColor = (hexColor) => {
      // Простая проверка яркости
      const hex = hexColor.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance > 0.5 ? '#000000' : '#ffffff'
    }
    
    // Получение светлого варианта цвета
    const getLightColor = (hexColor) => {
      // Добавляем прозрачность
      return hexColor + '20' // 12.5% прозрачности
    }
    
    // ========== МЕТОДЫ ДЛЯ ЦВЕТОВ В КОЛЛЕКЦИИ ==========
    
    // Копирование цвета
    const copyColor = async (color) => {
      try {
        await navigator.clipboard.writeText(color)
        showNotificationMessage('📋 Цвет скопирован')
      } catch (error) {
        console.error('Copy error:', error)
      }
    }
    
    // Добавление цвета в коллекцию
    const addColorToCollection = () => {
      if (!selectedCollection.value) return
      
      const index = collections.value.findIndex(c => c.id === selectedCollection.value.id)
      if (index !== -1) {
        if (Array.isArray(collections.value[index].palette)) {
          collections.value[index].palette.push({ hex: '#ffffff' })
        } else if (Array.isArray(collections.value[index].colors)) {
          collections.value[index].colors.push('#ffffff')
        }
        collections.value[index].updatedAt = new Date().toISOString()
        saveData()
        selectedCollection.value = collections.value[index]
        showNotificationMessage('🎨 Цвет добавлен')
      }
    }
    
    // Удаление цвета из коллекции
    const removeColorFromCollection = (colorIndex) => {
      if (!selectedCollection.value) return
      
      const index = collections.value.findIndex(c => c.id === selectedCollection.value.id)
      if (index !== -1) {
        const colors = getCollectionColors(collections.value[index])
        if (colors.length <= 1) {
          showNotificationMessage('❌ В коллекции должен быть хотя бы один цвет', 'error')
          return
        }
        
        if (Array.isArray(collections.value[index].palette)) {
          collections.value[index].palette.splice(colorIndex, 1)
        } else if (Array.isArray(collections.value[index].colors)) {
          collections.value[index].colors.splice(colorIndex, 1)
        }
        collections.value[index].updatedAt = new Date().toISOString()
        saveData()
        selectedCollection.value = collections.value[index]
        showNotificationMessage('🎨 Цвет удален')
      }
    }
    
    // ========== МЕТОДЫ ДЛЯ ФИЛЬТРАЦИИ ==========
    
    // Очистка поиска
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    // Переключение фильтров
    const toggleFilters = () => {
      showFilters.value = !showFilters.value
    }
    
    // Переключение фильтра по тегу
    const toggleTagFilter = (tag) => {
      const index = filterTags.value.indexOf(tag)
      if (index === -1) {
        filterTags.value.push(tag)
      } else {
        filterTags.value.splice(index, 1)
      }
    }
    
    // Применение фильтров
    const applyFilters = () => {
      currentPage.value = 1 // Сбрасываем на первую страницу
    }
    
    // Сброс фильтров
    const resetFilters = () => {
      searchQuery.value = ''
      filterType.value = ''
      filterCount.value = 0
      filterTags.value = []
      sortBy.value = 'date'
      currentPage.value = 1
      showFilters.value = false
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
    
    // Форматирование даты
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    // Показать уведомление
    const showNotificationMessage = (message, type = 'success') => {
      notificationText.value = message
      notificationIcon.value = type === 'error' ? '❌' : '✅'
      showNotification.value = true
      
      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    }
    
    // ========== НАБЛЮДАТЕЛИ И ЖИЗНЕННЫЙ ЦИКЛ ==========
    
    // Наблюдатель за изменением текущей страницы
    watch(currentPage, () => {
      // Прокручиваем вверх при смене страницы
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
    
    // Хук жизненного цикла
    onMounted(() => {
      loadData()
      
      // Загружаем демо-данные, если коллекций нет
      if (collections.value.length === 0) {
        collections.value = [
          {
            id: 1,
            name: 'Градиент Purple',
            description: 'Элегантные фиолетовые оттенки для дизайна',
            type: 'analogous',
            tags: ['градиент', 'фиолетовый', 'элегантный'],
            palette: [
              { hex: '#667eea' },
              { hex: '#764ba2' },
              { hex: '#f093fb' },
              { hex: '#f5576c' },
              { hex: '#4fd1c5' }
            ],
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'Природные тона',
            description: 'Спокойные цвета природы',
            type: 'complementary',
            tags: ['природа', 'спокойный', 'зеленый'],
            palette: [
              { hex: '#22543d' },
              { hex: '#38a169' },
              { hex: '#68d391' },
              { hex: '#c6f6d5' },
              { hex: '#f0fff4' }
            ],
            createdAt: '2024-01-14T14:20:00Z',
            updatedAt: '2024-01-14T14:20:00Z'
          }
        ]
        saveData()
      }
    })
    
    return {
      // Данные
      collections,
      favoriteCollections,
      selectedCollection,
      searchQuery,
      showFilters,
      filterType,
      filterCount,
      filterTags,
      sortBy,
      currentPage,
      showCollectionModal,
      showImportModal,
      showPreviewModal,
      editingCollection,
      collectionForm,
      tagInput,
      importJsonText,
      importUrl,
      previewColors,
      showNotification,
      notificationText,
      notificationIcon,
      
      // Вычисляемые свойства
      availableTags,
      hasActiveFilters,
      filteredCollections: paginatedCollections,
      totalPages,
      
      // Методы
      loadData,
      getCollectionColors,
      isFavorite,
      toggleFavorite,
      createNewCollection,
      editCollection,
      editSelectedCollection,
      addTag,
      removeTag,
      removeLastTag,
      addColor,
      removeColor,
      saveCollection,
      openCollection,
      duplicateCollection,
      duplicateSelectedCollection,
      deleteCollection,
      exportCollection,
      exportAsCss,
      exportAsScss,
      exportAsJson,
      exportAsTailwind,
      shareCollection,
      importCollection,
      importFromJson,
      importFromJsonText,
      importFromUrl,
      generatePreview,
      getContrastColor,
      getLightColor,
      copyColor,
      addColorToCollection,
      removeColorFromCollection,
      clearSearch,
      toggleFilters,
      toggleTagFilter,
      applyFilters,
      resetFilters,
      formatDate
    }
  }
}
</script>

<style scoped>
.library-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
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

/* Стили для поиска и фильтров */
.search-filters {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input-group {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search-btn:hover {
  background: #f7fafc;
  color: #e53e3e;
}

.filter-toggle-btn {
  padding: 1rem 1.5rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-toggle-btn:hover {
  background: #cbd5e0;
}

.filters-panel {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.color-count-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.count-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 50px;
}

.count-btn:hover {
  border-color: #667eea;
}

.count-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.tags-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
}

.tag-filter {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.tag-filter:hover {
  border-color: #667eea;
}

.tag-filter.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.apply-filters-btn,
.reset-filters-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.apply-filters-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 2;
}

.apply-filters-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.reset-filters-btn {
  background: #e2e8f0;
  color: #4a5568;
  flex: 1;
}

.reset-filters-btn:hover {
  background: #cbd5e0;
}

/* Стили для секций */
.library-content {
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-badge {
  background: #f6e05e;
  color: #744210;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.create-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.import-btn {
  padding: 0.75rem 1.5rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.import-btn:hover {
  background: #cbd5e0;
}

/* Стили для коллекций */
.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.collection-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.collection-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.collection-card.favorite {
  border-color: #f6e05e;
}

.collection-colors {
  display: flex;
  height: 80px;
}

.collection-color {
  flex: 1;
  transition: transform 0.2s;
}

.collection-color:hover {
  transform: scale(1.1);
  z-index: 1;
}

.collection-info {
  padding: 1.5rem;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.collection-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  flex: 1;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: #f7fafc;
}

.favorite-btn.active {
  color: #d69e2e;
}

.collection-description {
  color: #718096;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collection-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #a0aec0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.collection-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e2e8f0;
  color: #4a5568;
  border-radius: 15px;
  font-size: 0.8rem;
}

.tag.more {
  background: #cbd5e0;
  font-style: italic;
}

.collection-actions {
  display: flex;
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  border-radius: 4px;
}

.action-btn:hover {
  background: #e2e8f0;
}

.action-btn.delete:hover {
  background: #fed7d7;
  color: #e53e3e;
}

/* Стили для пустого состояния */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.empty-state p {
  margin-bottom: 2rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  margin: 0 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Стили для пагинации */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #cbd5e0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  background: #e2e8f0;
}

.page-number.active {
  background: #667eea;
  color: white;
}

/* Стили для боковой панели */
.collection-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background: white;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-sidebar-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-sidebar-btn:hover {
  background: #f7fafc;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.collection-details {
  margin-bottom: 2rem;
}

.collection-details h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.details-grid {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.detail-label {
  font-weight: 600;
  color: #4a5568;
}

.detail-value {
  color: #718096;
}

.collection-palette {
  margin-bottom: 2rem;
}

.collection-palette h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.palette-colors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.palette-color {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.palette-color:hover {
  border-color: #667eea;
  transform: translateX(5px);
}

.color-hex {
  flex: 1;
  font-family: monospace;
  font-weight: bold;
}

.remove-color-btn {
  background: #fed7d7;
  color: #e53e3e;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-color-btn:hover {
  background: #feb2b2;
}

.add-color-btn {
  padding: 1rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  text-align: center;
}

.add-color-btn:hover {
  background: #cbd5e0;
}

.collection-export {
  margin-bottom: 2rem;
}

.collection-export h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.export-option {
  padding: 0.75rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.export-option:hover {
  background: #cbd5e0;
}

.export-option.share {
  grid-column: span 2;
  background: #bee3f8;
  color: #2c5282;
}

.export-option.share:hover {
  background: #90cdf4;
}

.quick-actions {
  margin-bottom: 2rem;
}

.quick-actions h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-button {
  padding: 1rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  text-align: center;
}

.action-button:hover {
  background: #cbd5e0;
}

/* Стили для модальных окон */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-modal-btn:hover {
  background: #f7fafc;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error {
  border-color: #e53e3e;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.type-select {
  cursor: pointer;
}

.tags-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.tags-list .tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #e2e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  font-size: 1.2rem;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-tag-btn:hover {
  background: #cbd5e0;
}

.colors-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-editor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-picker {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.color-input {
  flex: 1;
}

.remove-color-btn {
  background: #fed7d7;
  color: #e53e3e;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-color-btn:hover {
  background: #feb2b2;
}

.remove-color-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e2e8f0;
  color: #a0aec0;
}

.add-color-btn {
  padding: 1rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  text-align: center;
  margin-top: 0.5rem;
}

.add-color-btn:hover {
  background: #cbd5e0;
}

.color-preview {
  margin-top: 2rem;
}

.color-preview h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.preview-colors {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preview-color {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 2px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Стили для модального окна импорта */
.import-options {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.import-option h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a5568;
}

.file-input {
  width: 100%;
  padding: 1rem;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.help-text {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.json-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 120px;
  margin-bottom: 1rem;
}

.url-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.import-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.import-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.import-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Стили для модального окна превью */
.preview-modal-content {
  max-width: 800px;
}

.preview-content {
  padding: 1.5rem;
}

.preview-palette {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.preview-color-big {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.color-hex-big {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem;
  font-family: monospace;
  text-align: center;
  font-size: 0.9rem;
}

.preview-ui {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
}

.ui-example {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.ui-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ui-header h4 {
  margin: 0;
  color: white;
  font-size: 1.2rem;
}

.ui-header button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.ui-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ui-card {
  padding: 1rem;
  border: 2px solid;
  border-radius: 8px;
}

.ui-card h5 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.ui-card p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

.ui-alert {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

/* Стили для уведомлений */
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 1rem 1.5rem;
  z-index: 3000;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-icon {
  font-size: 1.5rem;
}

.notification-text {
  font-weight: 600;
  color: #2d3748;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Анимации */
@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .library-view {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .collections-grid {
    grid-template-columns: 1fr;
  }
  
  .collection-sidebar {
    width: 100%;
  }
  
  .modal {
    max-height: 80vh;
  }
  
  .export-options {
    grid-template-columns: 1fr;
  }
  
  .export-option.share {
    grid-column: span 1;
  }
}

@media (max-width: 480px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .section-actions {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .page-numbers {
    order: -1;
  }
}
</style>