import { defineStore } from 'pinia'
import type { Advertisement } from '@/composables/useAdvertisements'

export const useSoldAutoStore = defineStore('soldAutoStore', {
  state: () => {
    const soldCars: Advertisement[] = []

    // localStorage.removeItem('soldAutoStore')

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('soldAutoStore')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            soldCars.push(...parsed)
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error)
      }
    }

    return { soldCars }
  },

  getters: {
    getSoldCars: (state) => state.soldCars
  },

  actions: {
    addToSoldCars(item: Advertisement) {
      this.soldCars.push(item)
      this.saveToLocalStorage()
      return true
    },

    saveToLocalStorage() {
      try {
        localStorage.setItem('soldAutoStore', JSON.stringify(this.soldCars))
      } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error)
      }
    },

    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('soldAutoStore')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.soldCars = parsed
        }
      } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error)
        // Очищаем поврежденные данные
        localStorage.removeItem('favorites')
      }
    }
  },
})
