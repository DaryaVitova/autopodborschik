import { defineStore } from 'pinia'
import type { Advertisement } from '@/composables/advertisements.ts'

export const useSoldAutoStore = defineStore('soldAutoStore', {
  state: () => {
    const soldCars: Advertisement[] = []

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

    removeFromSoldAuto(itemId: string) {
      const index = this.soldCars.findIndex(item => item.id === itemId)
      if (index !== -1) {
        this.soldCars.splice(index, 1)
        this.saveToLocalStorage()
        return true
      }
      return false
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
        localStorage.removeItem('favorites')
      }
    }
  },
})

export type SoldAutoStore = ReturnType<typeof useSoldAutoStore>
