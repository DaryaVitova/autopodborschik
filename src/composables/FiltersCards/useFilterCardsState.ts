import { reactive, ref } from 'vue'
import type { Advertisement } from "@/composables/useAdvertisements"

export interface FilterPrice {
  localMinPrice: number | null
  localMaxPrice: number | null
  activeMinPrice: number | null
  activeMaxPrice: number | null
}

export interface FilterMileage {
  localMinMileage: number | null
  localMaxMileage: number | null
  activeMinMileage: number | null
  activeMaxMileage: number | null
}

export type ResetKey = 'minPrice' | 'maxPrice' | 'minMileage' | 'maxMileage' |
  'searchBrand' | 'searchModel' | 'searchCity'

export function useFilterState() {
  // Текстовые фильтры
  const searchBrand = ref<string>('')
  const searchModel = ref<string>('')
  const searchCity = ref<string>('')

  // Фильтры по году
  const startYear = ref<number | null>(null)
  const endYear = ref<number | null>(null)

  // Фильтры по цене
  const dataFilterPrice = reactive<FilterPrice>({
    localMinPrice: null,
    localMaxPrice: null,
    activeMinPrice: null,
    activeMaxPrice: null
  })

  // Фильтры по пробегу
  const dataFilterMileage = reactive<FilterMileage>({
    localMinMileage: null,
    localMaxMileage: null,
    activeMinMileage: null,
    activeMaxMileage: null
  })

  // UI состояние
  const currentQuery = ref<string | null>(null)
  const searchError = ref<boolean>(false)
  const toggleSoldAuto = ref<boolean>(false)
  const currentPageItems = ref<Advertisement[]>([])

  // Флаги процессов
  const isFiltering = ref<boolean>(false)
  const isNavigating = ref<boolean>(false)
  const isRestoringFromBack = ref<boolean>(false)

  // Сохраненная страница
  const savedPageBeforeFilterData = ref<string | null | string[]>(null)

  return {
    // Текстовые фильтры
    searchBrand,
    searchModel,
    searchCity,

    // Года
    startYear,
    endYear,

    // Цена
    dataFilterPrice,

    // Пробег
    dataFilterMileage,

    // UI состояние
    currentQuery,
    searchError,
    toggleSoldAuto,
    currentPageItems,

    // Флаги
    isFiltering,
    isNavigating,
    isRestoringFromBack,

    // Сохраненная страница
    savedPageBeforeFilterData
  }
}
