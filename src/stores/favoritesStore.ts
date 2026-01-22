import { defineStore } from 'pinia'
import type { Advertisement } from '@/composables/useAdvertisements'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [] as Advertisement[],
    favoritesIds: new Set<string>() // Для быстрой проверки наличия
  }),

  getters: {
    // Получить все избранные
    getFavorites: (state) => state.favorites,

    // Проверить, есть ли в избранных
    isFavorite: (state) => (itemId: string) => {
      return state.favoritesIds.has(itemId)
    },
    // Количество избранных
    favoritesCount: (state) => state.favorites.length
  },

  actions: {
    // Добавить в избранное
    addToFavorites(item: Advertisement) {
      // Проверяем, нет ли уже в избранных
      if (this.favoritesIds.has(item.id)) {
        console.warn('Товар уже в избранных')
        return false
      }

      this.favorites.push(item)
      this.favoritesIds.add(item.id)
      this.saveToLocalStorage()
      return true
    },

    // Удалить из избранного
    removeFromFavorites(itemId: string) {
      const index = this.favorites.findIndex(item => item.id === itemId)
      if (index !== -1) {
        this.favorites.splice(index, 1)
        this.favoritesIds.delete(itemId)
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // Переключить состояние избранного
    toggleFavorite(item: Advertisement) {
      if (this.isFavorite(item.id)) {
        this.removeFromFavorites(item.id)
        return false // Удалили
      } else {
        this.addToFavorites(item)
        return true // Добавили
      }
    },

    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('favorites', JSON.stringify(this.favorites))
        } catch (error) {
          console.error('Ошибка сохранения в localStorage:', error)
        }
      }
    },

    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('favorites')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.favorites = parsed
          // Восстанавливаем Set из массива
          this.favoritesIds = new Set(parsed.map((item: Advertisement) => item.id))
        }
      } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error)
        // Очищаем поврежденные данные
        localStorage.removeItem('favorites')
      }
    },

    // Очистить избранное
    clearFavorites() {
      this.favorites = []
      this.favoritesIds.clear()
      localStorage.removeItem('favorites')
    }
  }
})
