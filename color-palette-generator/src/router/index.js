import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GeneratorView from '../views/GeneratorView.vue'
import LibraryView from '../views/LibraryView.vue'
import AccessibilityView from '../views/AccessibilityView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/generator',
    name: 'Generator',
    component: GeneratorView
  },
  {
    path: '/library',
    name: 'Library',
    component: LibraryView
  },
  {
    path: '/accessibility',
    name: 'Accessibility',
    component: AccessibilityView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router