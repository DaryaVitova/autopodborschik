import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Advertisement {
  id?: string | number
  brand?: string
  model?: string
  year?: number
  price?: number
  mileage?: number,
  phone?: number,
  city?: string
  photoUrls?: string[],
  description?: string
}

export const useAdvertisementStore = defineStore('advertisement', () => {
  const advertisement = ref<Advertisement>({})

  const getAdvertisement = () => advertisement.value

  const addAdvertisement = (ad: Advertisement) => {
    advertisement.value = ad
  }

  return {
    advertisement,
    getAdvertisement,
    addAdvertisement
  }
})
