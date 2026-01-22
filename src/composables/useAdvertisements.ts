import { ref, onUnmounted, type Ref } from 'vue'
import { db } from '@/firebase'
import { collection, onSnapshot } from "firebase/firestore"

export interface Advertisement {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  city: string;
  phone: string;
  price: number;
  description: string;
  photoUrls: string[];
  createdAt: string;
  hasPhotos: boolean;

  [key: string]: any
}

export function useAdvertisements() {
  const data: Ref<Advertisement[]> = ref([])
  const isLoading: Ref<boolean> = ref(true)
  let unsubscribeFn: (() => void) | null = null

  const subscribeToRealtimeUpdates = (): (() => void) => {
    if (unsubscribeFn) {
      unsubscribeFn()
    }

    isLoading.value = true

    unsubscribeFn = onSnapshot(
      collection(db, "advertisements"),
      (querySnapshot: any) => {
        const ads: Array<Advertisement & { _timestamp: number }> = []

        querySnapshot.forEach((doc: any) => {
          const docData = doc.data() as Record<string, any>

          const photos = Array.isArray(docData.photos) ? docData.photos : []
          const formattedPhotos = photos
            .map((photo: any) => photo?.medium || photo?.url || '')
            .filter((url: string) => url !== '')

          let timestamp = 0
          if (docData.createdAt) {
            try {
              if (
                docData.createdAt &&
                typeof docData.createdAt === 'object' &&
                'toDate' in docData.createdAt
              ) {
                timestamp = docData.createdAt.toDate().getTime()
              } else if (docData.createdAt instanceof Date) {
                timestamp = docData.createdAt.getTime()
              } else if (typeof docData.createdAt === 'string') {
                timestamp = new Date(docData.createdAt).getTime()
              } else if (typeof docData.createdAt === 'number') {
                timestamp = docData.createdAt
              }
            } catch (error) {
              console.error("Ошибка парсинга даты для сортировки:", error)
              timestamp = Date.now()
            }
          } else {
            timestamp = Date.now()
          }

          ads.push({
            id: doc.id,
            brand: docData.brand || '',
            model: docData.model || '',
            year: Number(docData.year) || 0,
            mileage: Number(docData.mileage) || 0,
            city: docData.city || '',
            phone: docData.phone || '',
            price: Number(docData.price) || 0,
            description: docData.description || '',
            photoUrls: formattedPhotos,
            createdAt: docData.createdAt ? formatDate(docData.createdAt) : '',
            hasPhotos: Boolean(docData.hasPhotos) || false,
            _timestamp: timestamp
          })
        })

        ads.sort((a, b) => b._timestamp - a._timestamp)

        // Убираем временное поле
        const sortedAds = ads.map(({ _timestamp, ...ad }) => ad)

        data.value = sortedAds
        console.log(data.value, 'data')
        isLoading.value = false
      },
      (error: unknown) => {
        console.error("Ошибка подписки Firebase:", error)
        isLoading.value = false
      }
    )

    return unsubscribeFn!
  }


  const formatDate = (firebaseTimestamp: unknown): string => {
    if (!firebaseTimestamp) return ''

    try {
      let date: Date

      if (
        firebaseTimestamp &&
        typeof firebaseTimestamp === 'object' &&
        'toDate' in firebaseTimestamp &&
        typeof (firebaseTimestamp as any).toDate === 'function'
      ) {
        date = (firebaseTimestamp as any).toDate()
      } else if (firebaseTimestamp instanceof Date) {
        date = firebaseTimestamp
      } else if (
        typeof firebaseTimestamp === 'string' ||
        typeof firebaseTimestamp === 'number'
      ) {
        date = new Date(firebaseTimestamp)
      } else {
        return String(firebaseTimestamp)
      }

      if (isNaN(date.getTime())) {
        return String(firebaseTimestamp)
      }

      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error: unknown) {
      console.error("Ошибка форматирования даты:", error)
      return String(firebaseTimestamp)
    }
  }

  const unsubscribe = (): void => {
    if (unsubscribeFn) {
      unsubscribeFn()
      unsubscribeFn = null
    }
  }

  subscribeToRealtimeUpdates()

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    data,
    isLoading,
    subscribeToRealtimeUpdates,
    unsubscribe,
    formatDate
  }
}

export type UseAdvertisementsReturn = ReturnType<typeof useAdvertisements>
