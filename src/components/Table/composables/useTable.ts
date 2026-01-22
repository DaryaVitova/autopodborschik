import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import { computed, onMounted, reactive, ref, watch, type Ref } from 'vue'
import type { Headers } from "@/views/TableView.vue";
import type { Advertisement } from "@/composables/useAdvertisements.ts";

type StringObj = Record<string, string | string[]>
type PayloadVisibleFilter = { headerKey: string }

export function useTable (headers: Headers[], data: Advertisement[]) {
  const route = useRoute()
  const router = useRouter()

  const currentPageItems: Ref<Advertisement[]> = ref([])
  const columnPerPage: Ref<number> = ref(3)

  const openFilterInputs = reactive<Record<string, boolean>>({})
  const loader: Ref<boolean> = ref(true)
  const localData: Ref<Advertisement[]> = ref([])
  const cloneLocalData = ref<Advertisement[] | null>(null)
  const isFilterActive: Ref<boolean> = ref(false)
  const activeFilterKeys = ref<StringObj>({})
  const inputValues = ref<StringObj>({})
  const activeMenu = ref(null)

  // ✅ Флаг для предотвращения циклических обновлений
  const isInitialized: Ref<boolean> = ref(false)

  const isDataLoaded: Ref<boolean> = ref(false)

  onMounted(() => {
    console.log(data, 'data')
    if (route.query.count) {
      columnPerPage.value = Number(route.query.count)
    }
    setTimeout(() => {
      loader.value = false
    }, 1000)
  })

  const headersKeys = computed(() => {
    const headerKeys = headers.map((header: Headers) => header.key)
    return headerKeys.reduce<string[]>((acc: string[], key: string) => {
      if (acc.includes(key)) {
        return acc
      }
      return [...acc, key]
    }, [])
  })

  const initializeFromQuery = (): void => {
    // Ждем пока данные загрузятся
    if (!isDataLoaded.value) {
      return
    }

    const searchParams: Record<string, string | string[]> = {}
    let sortKey: string | null = null
    let sortDirection: 'asc' | 'desc' | null = null

    const query = route.query as Record<string, string | string[] | undefined>

    Object.keys(query).forEach((key: string) => {
      const value = query[key]

      if (key.startsWith('search_') && value !== undefined) {
        const originalKey = key.replace('search_', '')
        searchParams[originalKey] = value
      } else if (value === 'asc' || value === 'desc') {
        sortKey = key
        sortDirection = value
      }
    })

    activeFilterKeys.value = searchParams
    isFilterActive.value = Object.keys(searchParams).length > 0

    localData.value = JSON.parse(JSON.stringify(data))

    if (Object.keys(searchParams).length > 0) {
      applyFilters() // true
    }

    if (sortKey && sortDirection) {
      sorting(sortDirection, sortKey)
    }

    isInitialized.value = true
  }

  watch(
    () => route.query,
    (newQuery) => {
      localStorage.setItem('tableQuery', JSON.stringify(newQuery))

      if (!isInitialized.value) {
        initializeFromQuery()
        return
      }

      const searchParams: Record<string, string | string[]> = {}
      let sortKey: string | null = null
      let sortDirection: 'asc' | 'desc' | null = null

      const query = route.query as Record<string, string | string[] | undefined>

      Object.keys(query).forEach((key: string) => {
        const value = query[key]

        if (key.startsWith('search_') && value !== undefined) {
          const originalKey = key.replace('search_', '')
          searchParams[originalKey] = value
        } else if (value === 'asc' || value === 'desc') {
          sortKey = key
          sortDirection = value
        }
      })

      activeFilterKeys.value = searchParams
      isFilterActive.value = Object.keys(searchParams).length > 0

      if (sortKey && sortDirection) {
        sorting(sortDirection, sortKey)
      } else if (Object.keys(searchParams).length === 0 && !isFilterActive.value) {
        localData.value = JSON.parse(JSON.stringify(data))
      }

      if (Object.keys(searchParams).length > 0) {
        applyFilters()
      }
    },
    { immediate: true }
  )

  watch(() => headers, (newHeaders) => {
    if (!newHeaders) return
    newHeaders.forEach(h => {
      if (!(h.key in inputValues.value)) {
        inputValues.value[h.key] = ''
      }
    })
  }, { immediate: true })

  watch(() => data, (val) => {
    console.log(val, 'data.val')
    if (val && val.length > 0) {
      console.log('pizda')
      isDataLoaded.value = true

      if (!isInitialized.value) {
        localData.value = JSON.parse(JSON.stringify(val))
        initializeFromQuery()
      } else if (!isFilterActive.value) {
        localData.value = JSON.parse(JSON.stringify(val))
        const currentSortKey = Object.keys(route.query).find(key =>
          !key.startsWith('search_') && (route.query[key] === 'asc' || route.query[key] === 'desc')
        )
        if (currentSortKey) {
          const rawValue = route.query[currentSortKey]

          // Приводим к нужному типу
          const direction =
            rawValue === 'asc' || rawValue === 'desc' ? rawValue :
              rawValue === null ? null :
                undefined

          sorting(direction, currentSortKey)
        }
      }
    }
  }, { immediate: true })

  // Методы

  const handleColumnPerPage = (items: number): void => {
    columnPerPage.value = items
  }

  const handlePageChange = (items: Advertisement[]): void => {
    currentPageItems.value = items
  }

  function toggleSort (link: Headers['key']): void {
    const currentQuery = { ...route.query } as Record<string, any>
    const newQuery: Record<string, any> = {}

    // Копируем только нужные параметры
    Object.keys(currentQuery).forEach(key => {
      if (key.startsWith('search_') || key === 'page' || key === 'count') {
        newQuery[key] = currentQuery[key]
      }
    })

    if (link in currentQuery) {
      if (currentQuery[link] === 'asc') {
        newQuery[link] = 'desc'
        router.push({ name: 'main', query: newQuery })
        sorting('desc', link)
      } else {
        // ✅ При сбросе сортировки просто не добавляем параметр сортировки
        router.push({ name: 'main', query: newQuery })
        sorting(null)
      }
    } else {
      // ✅ Добавляем новую сортировку (все старые уже удалены)
      newQuery[link] = 'asc'
      router.push({ name: 'main', query: newQuery })
      sorting('asc', link)
    }
  }

  function highlightText (value: string, key: Headers['key']) {
    if (!value) return ''

    if (key in activeFilterKeys.value && activeFilterKeys.value[key]) {
      const searchTerm = activeFilterKeys.value[key]
      const regex = new RegExp(`(${searchTerm})`, 'gi')
      return value.replace(regex, '<mark class="search-highlight">$1</mark>')
    }

    return value
  }

  const sorting = (
    direction: 'asc' | 'desc' | null | undefined,
    fieldName: string | null = null
  ): void => {
    if (direction === undefined) {
      direction = null
    }

    if (!direction || !fieldName) {
      // Сбрасываем к исходным данным
      localData.value = isFilterActive.value
        ? JSON.parse(JSON.stringify(localData.value))
        : JSON.parse(JSON.stringify(data))
      return
    }

    const dataToSort = isFilterActive.value
      ? JSON.parse(JSON.stringify(localData.value))
      : JSON.parse(JSON.stringify(data))

    // Выполняем сортировку
    if (direction === 'asc') {
      localData.value = dataToSort.sort((a: Advertisement, b: Advertisement): number => {
        const valueA = (a as any)[fieldName!]
        const valueB = (b as any)[fieldName!]
        return compareValues(valueA, valueB, 'asc')
      })
    } else if (direction === 'desc') {
      localData.value = dataToSort.sort((a: Advertisement, b: Advertisement): number => {
        const valueA = (a as any)[fieldName!]
        const valueB = (b as any)[fieldName!]
        return compareValues(valueA, valueB, 'desc')
      })
    }
  }

  function compareValues (valueA: any, valueB: any, direction: 'asc' | 'desc'): 0 | 1 | -1 {
    if (!valueA && !valueB) return 0

    if (!valueA && valueB) {
      return direction === 'asc' ? 1 : -1
    }

    if (valueA && !valueB) {
      return direction === 'asc' ? -1 : 1
    }

    if (valueA < valueB) return direction === 'asc' ? -1 : 1
    if (valueA > valueB) return direction === 'asc' ? 1 : -1
    return 0
  }

  function toggleVisibleFilter (payload: PayloadVisibleFilter): void {
    const { headerKey } = payload
    openFilterInputs[headerKey] = !openFilterInputs[headerKey]
  }

  function resetFiltering (headerKey: string, input: { value: string }): void {
    delete activeFilterKeys.value[headerKey]

    const currentQuery = { ...route.query }
    const newQuery = { ...currentQuery }

    const searchKey = `search_${headerKey}`
    delete newQuery[searchKey]

    router.push({ name: 'main', query: newQuery })

    if (Object.keys(activeFilterKeys.value).length > 0) {
      applyFilters()
    } else {
      localData.value = JSON.parse(JSON.stringify(data))
      isFilterActive.value = false
    }

    input.value = ''
    openFilterInputs[headerKey] = false
  }

  function isDefined<T>(value: T): value is NonNullable<T> {
    return value !== undefined && value !== null
  }

  function filterTable (headerKey: string, value: string): void {
    if (headerKey in activeFilterKeys.value) {
      if (value) {
        activeFilterKeys.value[headerKey] = value
      } else {
        delete activeFilterKeys.value[headerKey]
      }
    } else {
      activeFilterKeys.value[headerKey] = value
    }

    const currentQuery = { ...route.query } as LocationQuery
    const newQuery: LocationQuery = { ...currentQuery }

    // Обновляем параметры фильтрации
    Object.keys(activeFilterKeys.value).forEach(key => {
      const searchKey = `search_${key}`
      const filterValue = activeFilterKeys.value[key]

      if (isDefined(filterValue)) {
        newQuery[searchKey] = filterValue
      }
    })

    // Удаляем параметры фильтрации, которых больше нет
    Object.keys(newQuery).forEach(queryKey => {
      if (queryKey.startsWith('search_')) {
        const originalKey = queryKey.replace('search_', '')
        if (!(originalKey in activeFilterKeys.value)) {
          delete newQuery[queryKey]
        }
      }
    })

    router.push({ name: 'main', query: newQuery })
    applyFilters()
  }

  function applyFilters (): void {
    let filtered: Advertisement[] = JSON.parse(JSON.stringify(data))

    Object.entries(activeFilterKeys.value).forEach(([key, val]) => {
      if (!val && String(val).trim() !== '') return
      filtered = filtered.filter((item: Advertisement) =>
        item[key] && item[key].toString().toLowerCase().includes(val.toString().toLowerCase())
      )
    })

    localData.value = filtered
    cloneLocalData.value = localData.value
    isFilterActive.value = Object.keys(activeFilterKeys.value).length > 0

    // ✅ Применяем сортировку после фильтрации
    const currentSortKey = Object.keys(route.query).find(key =>
      !key.startsWith('search_') && (route.query[key] === 'asc' || route.query[key] === 'desc')
    )
    if (currentSortKey) {
      const rawValue = route.query[currentSortKey]
      const direction = (rawValue === 'asc' || rawValue === 'desc') ? rawValue : null
      sorting(direction, currentSortKey)
    }
  }

  // const setActiveMenu = (menuId): void => {
  //   activeMenu.value = menuId
  // }

  return {
    openFilterInputs,
    loader,
    localData,
    isFilterActive,
    activeFilterKeys,
    activeMenu,
    columnPerPage,
    currentPageItems,

    headersKeys,

    handlePageChange,
    handleColumnPerPage,
    toggleSort,
    highlightText,
    toggleVisibleFilter,
    resetFiltering,
    filterTable,
    applyFilters
  }
}
