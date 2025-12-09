<template>
  <div class="palette-library">
    <div class="library-header">
      <h2>📚 Моя библиотека палитр</h2>
      <div class="header-actions">
        <input 
          v-model="searchQuery"
          placeholder="Поиск по названию или тегам..."
          class="search-input"
        />
        <button @click="createNewCollection" class="btn btn-primary">
          + Новая коллекция
        </button>
      </div>
    </div>
    
    <div class="collections-container">
      <div 
        v-for="collection in filteredCollections" 
        :key="collection.id"
        class="collection-card"
      >
        <div class="collection-header">
          <h3>{{ collection.name }}</h3>
          <div class="collection-meta">
            <span class="tag" v-for="tag in collection.tags" :key="tag">
              {{ tag }}
            </span>
            <span class="date">
              {{ formatDate(collection.createdAt) }}
            </span>
          </div>
        </div>
        
        <div class="collection-palettes">
          <div 
            v-for="palette in collection.palettes.slice(0, 3)" 
            :key="palette.id"
            class="palette-preview"
            @click="selectPalette(palette)"
          >
            <div class="preview-colors">
              <div 
                v-for="color in palette.colors" 
                :key="color.id"
                class="preview-color"
                :style="{ backgroundColor: color.hex }"
                :title="color.hex"
              ></div>
            </div>
            <p class="palette-name">{{ palette.name }}</p>
          </div>
        </div>
        
        <div class="collection-actions">
          <button @click="editCollection(collection)" class="btn btn-small">
            ✏️ Редактировать
          </button>
          <button @click="deleteCollection(collection.id)" class="btn btn-small btn-danger">
            🗑️ Удалить
          </button>
          <button @click="exportCollection(collection)" class="btn btn-small btn-success">
            📤 Экспорт
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно создания/редактирования коллекции -->
    <div v-if="showCollectionModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingCollection ? 'Редактировать коллекцию' : 'Новая коллекция' }}</h3>
        
        <div class="modal-form">
          <div class="form-group">
            <label>Название коллекции:</label>
            <input v-model="collectionForm.name" type="text" />
          </div>
          
          <div class="form-group">
            <label>Теги (через запятую):</label>
            <input v-model="collectionForm.tags" type="text" />
          </div>
          
          <div class="form-group">
            <label>Описание:</label>
            <textarea v-model="collectionForm.description" rows="3"></textarea>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="saveCollection" class="btn btn-primary">
            Сохранить
          </button>
          <button @click="showCollectionModal = false" class="btn">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'PaletteLibrary',
  setup() {
    // Реактивные данные
    const collections = ref([])
    const searchQuery = ref('')
    const showCollectionModal = ref(false)
    const editingCollection = ref(null)
    const collectionForm = ref({
      name: '',
      tags: '',
      description: ''
    })
    
    // Фильтрация коллекций по поисковому запросу
    const filteredCollections = computed(() => {
      if (!searchQuery.value) return collections.value
      
      const query = searchQuery.value.toLowerCase()
      return collections.value.filter(collection => 
        collection.name.toLowerCase().includes(query) ||
        collection.tags.some(tag => tag.toLowerCase().includes(query)) ||
        collection.description.toLowerCase().includes(query)
      )
    })
    
    // Загрузка коллекций из localStorage
    const loadCollections = () => {
      const saved = localStorage.getItem('paletteCollections')
      if (saved) {
        collections.value = JSON.parse(saved)
      }
    }
    
    // Сохранение коллекций в localStorage
    const saveCollections = () => {
      localStorage.setItem('paletteCollections', JSON.stringify(collections.value))
    }
    
    // Создание новой коллекции
    const createNewCollection = () => {
      collectionForm.value = {
        name: '',
        tags: '',
        description: ''
      }
      editingCollection.value = null
      showCollectionModal.value = true
    }
    
    // Редактирование коллекции
    const editCollection = (collection) => {
      collectionForm.value = {
        name: collection.name,
        tags: collection.tags.join(', '),
        description: collection.description
      }
      editingCollection.value = collection
      showCollectionModal.value = true
    }
    
    // Сохранение коллекции
    const saveCollection = () => {
      if (!collectionForm.value.name.trim()) {
        alert('Введите название коллекции')
        return
      }
      
      const tags = collectionForm.value.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      
      const collectionData = {
        id: editingCollection.value?.id || Date.now(),
        name: collectionForm.value.name.trim(),
        tags,
        description: collectionForm.value.description.trim(),
        createdAt: editingCollection.value?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        palettes: editingCollection.value?.palettes || []
      }
      
      if (editingCollection.value) {
        const index = collections.value.findIndex(c => c.id === editingCollection.value.id)
        collections.value[index] = collectionData
      } else {
        collections.value.push(collectionData)
      }
      
      saveCollections()
      showCollectionModal.value = false
    }
    
    // Удаление коллекции
    const deleteCollection = (collectionId) => {
      if (confirm('Удалить коллекцию?')) {
        collections.value = collections.value.filter(c => c.id !== collectionId)
        saveCollections()
      }
    }
    
    // Экспорт коллекции
    const exportCollection = (collection) => {
      const data = {
        collection,
        exportedAt: new Date().toISOString(),
        format: 'palette-library-v1'
      }
      
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${collection.name.replace(/\s+/g, '-')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    // Выбор палитры
    const selectPalette = (palette) => {
      // Эмитируем событие выбора палитры
      emit('paletteSelected', palette)
    }
    
    // Форматирование даты
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }
    
    // Хук жизненного цикла
    onMounted(() => {
      loadCollections()
    })
    
    return {
      collections,
      searchQuery,
      showCollectionModal,
      editingCollection,
      collectionForm,
      filteredCollections,
      loadCollections,
      createNewCollection,
      editCollection,
      saveCollection,
      deleteCollection,
      exportCollection,
      selectPalette,
      formatDate
    }
  }
}
</script>

<style scoped>
.palette-library {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.library-header {
  margin-bottom: 40px;
}

.header-actions {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  font-size: 16px;
}

.collections-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.collection-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.collection-card:hover {
  transform: translateY(-5px);
}

.collection-header {
  margin-bottom: 20px;
}

.collection-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.collection-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.tag {
  background: #e2e8f0;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  color: #4a5568;
}

.date {
  font-size: 12px;
  color: #718096;
  margin-left: auto;
}

.collection-palettes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.palette-preview {
  cursor: pointer;
}

.preview-colors {
  display: flex;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.preview-color {
  flex: 1;
}

.palette-name {
  font-size: 12px;
  text-align: center;
  color: #4a5568;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-danger {
  background: #fc8181;
  color: white;
}

.btn-success {
  background: #48bb78;
  color: white;
}

/* Модальное окно */
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
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-form {
  margin: 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>