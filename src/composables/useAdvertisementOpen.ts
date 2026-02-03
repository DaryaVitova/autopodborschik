import { useRouter } from 'vue-router'
import type { Advertisement } from '@/composables/useAdvertisements'

export const useAdvertisementOpen = () => {
  const router = useRouter()

  const openCard = (row: Advertisement, showSold?: boolean): void => {
    if (!row?.id) {
      console.error('Invalid advertisement data:', row)
      return
    }
    // Сохраняем в localStorage
    localStorage.setItem('advertisements', JSON.stringify(row))

    // Используем router из composable
    router.push({
      name: 'showAd',
      params: { id: row.id },
      query: showSold ? { showSold: 'true' } : {}
    })
  }

  return {
    openCard
  }
}
