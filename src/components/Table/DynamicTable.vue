<template>
  <div class="table__pagination-select">
    <select
      name="amountTable"
      id="amountTable-select"
      class="table__pagination-select--select"
      v-model="columnPerPage"
    >
      <option :value="6">6</option>
      <option :value="9">9</option>
      <option :value="12">12</option>
    </select>
    <label
      for="amountTable-select"
      class="table__pagination-select--label"
    >
      вариантов на странице
    </label>
  </div>

  <div class="table__checkbox">
    <input
      type="checkbox"
      v-model="toggleSoldAutoInTable"
      id="checkbox"
      class="table__checkbox--mark"
    />
    <label for="checkbox">Показать проданные</label>
  </div>

  <div class="table-container" :class="{ 'table-container--loading': loader }">
    <table class="table">
      <thead class="table__head">
      <tr class="table__headers">
        <th
          v-for="header in headers"
          :key="header.key"
          class="table__header"
          v-show="!isColumnHidden(header.key)"
          @contextmenu.prevent.stop="openContextMenu(header, headers.indexOf(header), $event, menuFieldsHeader)"
        >
          <InputTable
            :openInput="openFilterInputs[header.key]"
            :header="header"
            @setSelectColumn="(key, val) => filterTable(key, val)"
            @reset-filtering="(header, input) => resetFiltering(header.key, input)"
          >
          </InputTable>
          <div class="table__cell">
            {{ header.text }}
            <icons-table
              @toggle-sort="toggleSort(header.key)"
              @toggle-visible-filter="toggleVisibleFilter"
              :sortable="header?.sortable"
              :filter="header.filter?.search"
              :headerKey="header.key"
            />
          </div>
        </th>
      </tr>
      </thead>

      <tbody v-if="localData.length > 0 && !loader" class="table__body">
      <tr v-for="(row, rowIndex) in currentPageItems"
          class="table__row-column"
          :key="rowIndex"
          @contextmenu.prevent
          @click="handleRowClick(row)"
      >
        <td
          class="table__element"
          v-for="header in headers"
          :key="header.key"
          v-show="!isColumnHidden(header.key)"
        >
          <div v-if="row[header.key] && !isFilterActive">{{ row[header.key] }}</div>
          <div
            v-if="row[header.key] && isFilterActive"
            v-html="highlightText(row[header.key], header.key)"
          >
          </div>
        </td>
      </tr>
      </tbody>
      <caption v-if="localData.length === 0 && !loader" class="table__element--no-data">Нет данных</caption>
    </table>

    <context-menu-table
      :visible="menuStatus"
      :position="menuPosition"
      :menuField="menuField"
      :hiddenColumns="hiddenColumns"
      @close="closeContextMenu"
      @action="handleMenuAction"
    />

    <loader-table v-if="loader" />
  </div>

  <PaginationViews
    v-show="!loader"
    :columnPerPage="columnPerPage"
    :data="localData"
    showCountRecords
    @change-page="handlePageChange"
    @newColumnPerPage="handleColumnPerPage"
  />
</template>
<script setup lang="ts">
import {defineProps, watch} from 'vue'
import IconsTable from '@/components/Table/IconsTable.vue'
import LoaderTable from '@/components/Table/LoaderTable.vue'
import InputTable from '@/components/Table/InputTable.vue'
import ContextMenuTable from '@/components/Table/ContextMenuTable.vue'
// import PaginationViews from '@/common/PaginationViews.vue'
import { useContextMenu } from '@/components/Table/composables/useContextMenu.ts'
import type { Headers } from "@/views/TableView.vue";
import type { Advertisement } from "@/composables/advertisements.ts";
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import { onMounted, reactive, ref, type Ref } from 'vue'

interface Props {
  headers: Headers[],
  data: Advertisement[],
  loader: Boolean
}

interface Emits {
  (e: 'row-click', value: Advertisement): void,
  (e: 'show-sold-auto', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

type StringObj = Record<string, string | string[]>
type PayloadVisibleFilter = { headerKey: string }


const route = useRoute()
const router = useRouter()

const currentPageItems: Ref<Advertisement[]> = ref([])
const columnPerPage: Ref<number> = ref(6)

const openFilterInputs = reactive<Record<string, boolean>>({})
const loader: Ref<boolean> = ref(true)
const localData: Ref<Advertisement[]> = ref([])
const cloneLocalData = ref<Advertisement[] | null>(null)
const isFilterActive: Ref<boolean> = ref(false)
const activeFilterKeys = ref<StringObj>({})
const inputValues = ref<StringObj>({})

const isInitialized: Ref<boolean> = ref(false)

const isDataLoaded: Ref<boolean> = ref(false)

const toggleSoldAutoInTable = ref<boolean>(false)

onMounted(() => {
  toggleSoldAutoInTable.value = route.query.showSold === 'true'

  if (route.query.count) {
    columnPerPage.value = Number(route.query.count)
  }
  setTimeout(() => {
    loader.value = false
  }, 1000)
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

  localData.value = JSON.parse(JSON.stringify(props.data))

  if (Object.keys(searchParams).length > 0) {
    applyFilters()
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
      localData.value = JSON.parse(JSON.stringify(props.data))
    }

    if (Object.keys(searchParams).length > 0) {
      applyFilters()
    }
  },
  { immediate: true }
)

watch(() => toggleSoldAutoInTable.value, (newVal) => {
  const query = { ...route.query }

  if (newVal) {
    query.showSold = 'true'
  } else {
    delete query.showSold
  }

  router.push({ query })

  emit('show-sold-auto', newVal)
})

watch(() => props.headers, (newHeaders) => {
  if (!newHeaders) return
  newHeaders.forEach(h => {
    if (!(h.key in inputValues.value)) {
      inputValues.value[h.key] = ''
    }
  })
}, { immediate: true })

watch(() => props.data, (val) => {
  if (val && val.length > 0) {
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

const handleRowClick = (row: Advertisement): void => {
  emit('row-click', row)
}

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
      router.push({ name: 'table', query: newQuery })
      sorting('desc', link)
    } else {
      //  При сбросе сортировки просто не добавляем параметр сортировки
      router.push({ name: 'table', query: newQuery })
      sorting(null)
    }
  } else {
    // Добавляем новую сортировку (все старые уже удалены)
    newQuery[link] = 'asc'
    router.push({ name: 'table', query: newQuery })
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
      : JSON.parse(JSON.stringify(props.data))
    return
  }

  const dataToSort = isFilterActive.value
    ? JSON.parse(JSON.stringify(localData.value))
    : JSON.parse(JSON.stringify(props.data))

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

  router.push({ name: 'table', query: newQuery })

  if (Object.keys(activeFilterKeys.value).length > 0) {
    applyFilters()
  } else {
    localData.value = JSON.parse(JSON.stringify(props.data))
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

  console.log(activeFilterKeys.value, 'activeFilterKeys.value')

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
  router.push({ name: 'table', query: newQuery })
}

function applyFilters (): void {
  let filtered: Advertisement[] = JSON.parse(JSON.stringify(props.data))

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

const {
  menuStatus,
  menuField,
  menuPosition,
  hiddenColumns,

  menuFieldsHeader,

  openContextMenu,
  closeContextMenu,
  handleMenuAction,
  isColumnHidden
} = useContextMenu(props.headers)
</script>

<style lang="scss">
@use '@/assets/scss/mixins' as *;

.table {
  margin-top: 60px;
  margin-inline: 20px;
  border-radius: 3px;
  &__body {
    position: relative;
  }
  &:has(.table__body--no-data) {
    display: flex;
    flex-direction: column;
  }
  &__header, &__body {
    width: 200px;
  }
  &__header {
    position: relative;
    padding-block: 5px;
    white-space: nowrap;
    color: #04224e;
  }
  &__pagination-select {
    margin-top: 60px;
    text-align: center;
    &--select {
      padding: 3px;
    }
    &--label {
      font-weight: 500;
      color: #05080b;
      margin-left: 5px;
    }
  }

  &__checkbox {
    @include checkbox;
    align-self: center;
    margin-top: 30px;
  }

  &__row-column {
    height: 30px;
    &:hover {
      cursor: pointer;
      background-color: #c6d7e8 !important;
    }
    &:nth-child(odd) {
      background-color: #e4e4e4;
    }
  }
  &__element {
    padding-left: 12px;
    padding-block: 7px;
    white-space: nowrap;
    &--no-data {
      align-self: center;
      margin-top: 10px;
    }
  }
  &__cell {
    display: flex;
    justify-content: center;
    padding-block: 2px;
  }
}
.table-container:has(.table-loader) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media(max-width: 1024px) {
  .table {
    &__element {
      & div {
        font-size: 14px;
      }
    }

    &__header {
      font-size: 14px;
    }
  }
}

@media(max-width: 747px) {
  .table-container {
    overflow-x: auto;
    width: 100vw;
    max-width: 100vw;
    &--loading {
      overflow-x: hidden;
    }
  }

  .table {
    min-width: 100%;
    &__header, &__element {
      min-width: 150px;
      white-space: nowrap;
    }
  }
}
</style>
