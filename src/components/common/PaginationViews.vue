<template>
  <div
    class="pagination-container"
    :style="{ justifyContent: showCountRecords ? 'space-between' : 'center' }"
  >
    <span
      v-if="showCountRecords"
      class="pagination-container__count-showElem"
    >
      Показано с {{ startData }} по {{ endData }} из {{ props.data.length }} записей
    </span>
    <div class="pagination">
      <button
        class="pagination__button"
        @click="prevPage"
        :disabled="disabledPrev"
      >
        Назад
      </button>

      <button
        v-for="page in pages"
        :key="page"
        @click="goToPage(page)"
        class="pagination__btn"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>

      <button
        class="pagination__button"
        @click="nextPage"
        :disabled="disabledNext"
      >
        Вперёд
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Advertisement } from "@/composables/useAdvertisements";

const props = withDefaults(defineProps<{
  columnPerPage: number,
  data: Advertisement[],
  showCountRecords?: boolean
}>(), {
  showCountRecords: false
})

const emit = defineEmits(['changePage', 'newColumnPerPage'])

const router = useRouter()
const route = useRoute()

const isInitialized = ref<boolean>(false)
const isRestoringState = ref<boolean>(false)

const currentPage = ref<number>(1)
const columnPerPageLocal = ref<number>(props.columnPerPage)

const disabledNext = ref<boolean>(false)
const disabledPrev = ref<boolean>(true)

const isRestoringPages = ref<boolean>(false)

const startData = ref<number | null>(null)
const endData = ref<number | null>(null)

const totalPages = computed((): number => { // сколько нужно страниц отобразить
  if (!props.data.length) {
    return 1
  }
  return Math.ceil(props.data.length / columnPerPageLocal.value)
})

const paginatedItems = computed((): Advertisement[] => {
  const start = (currentPage.value - 1) * columnPerPageLocal.value
  const end = start + columnPerPageLocal.value
  return props.data.slice(start, end)
})

const getPages = (total: number): number[] => {
  if (total === 1) {
    disabledNext.value = true
    disabledPrev.value = true
    return [1]
  }
  if (total === 2) {
    disabledNext.value = true
    disabledPrev.value = true
    return [1, 2]
  } else {
    return [1, 2, 3]
  }
}

const pages = ref<number[]>(getPages(totalPages.value))

watch(
  () => router.currentRoute.value.query,
  (newQuery) => {
    if (isRestoringState.value) {
      return
    }

    const getQueryNumber = (key: string): number | null => {
      const value = newQuery[key]
      if (typeof value === 'string') {
        const num = parseInt(value)
        return isNaN(num) ? null : num
      }
      return null
    }

    const pageFromQuery = getQueryNumber('page')
    const countFromQuery = getQueryNumber('count')

    if (pageFromQuery !== null && pageFromQuery > 0) {
      currentPage.value = pageFromQuery
    }

    if (countFromQuery !== null && countFromQuery > 0) {
      columnPerPageLocal.value = countFromQuery
    }

    isInitialized.value = true
  },
  { immediate: true }
)

watch(totalPages, (newTotal) => {
  if (!isRestoringPages.value) {
    pages.value = getPages(newTotal)
  }
  if (newTotal < currentPage.value) {
    currentPage.value = newTotal
  }
  if (currentPage.value === 0) {
    currentPage.value = 1
  }
})

watch(() => props.columnPerPage, (newVal) => {
  columnPerPageLocal.value = newVal
})

watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage && isInitialized.value && !isRestoringState.value) {
    updateQuery()
    getPageRange()
  }
})

watch(columnPerPageLocal, (newVal, oldVal) => {
  emit('newColumnPerPage', newVal)
  if (newVal !== oldVal && isInitialized.value && !isRestoringState.value) {
    currentPage.value = 1
    updateQuery()
  }
  getPageRange()
})

watch(() => props.data, () => {
  if (currentPage.value > totalPages.value && isInitialized.value) {
    currentPage.value = Math.max(1, totalPages.value)
    if (!isRestoringState.value) {
      updateQuery()
    }
  }
  getPageRange()
}, { immediate: true })

watch(paginatedItems, (newVal) => {
  emit('changePage', newVal)
}, { immediate: true })

watch(() => pages.value, (newPages) => {
  const prevPage = Number(newPages[0])
  disabledPrev.value = isDisabledPrev(prevPage)

  const lastPage = Number(newPages.slice(-1))
  disabledNext.value = (lastPage === totalPages.value)
})

watch(
  () => route.query.page,
  (newPage) => {
    if (newPage) {
      const numPage = Number(newPage);
      if (!isNaN(numPage) && numPage > 0) {
        currentPage.value = numPage
      }
    }
  },
  { immediate: true }
)

function prevPage (): void {
  const prevPage = Number(pages.value.slice(0, 1).join())
  if (prevPage !== 1) {
    const newPages = pages.value.map((page) => {
      return page - 1
    })
    pages.value = newPages
  }
}

function nextPage (): void {
  const lastPage = Number(pages.value.slice(-1).join())
  if (lastPage !== totalPages.value) {
    const newPages = pages.value.map((page) => {
      return page + 1
    })
    pages.value = newPages
  }
}

function isDisabledPrev (prevPage: number): boolean {
  if (prevPage === 1) {
    return true
  } else {
    return false
  }
}

function getPageRange (): void {
  const startIndex = (currentPage.value - 1) * columnPerPageLocal.value
  const endIndex = Math.min(startIndex + columnPerPageLocal.value, props.data.length)

  props.data.length !== 0 ? startData.value = startIndex + 1 : startData.value = 0
  endData.value = endIndex
}

function goToPage (page: number): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })

  currentPage.value = page
  getPageRange()
  updateQuery()
}

function updateQuery(): void {
  const query = {
    ...router.currentRoute.value.query,
    page: currentPage.value,
    count: columnPerPageLocal.value
  } as Record<string, string | string[] | number>

  Object.keys(query).forEach(key => {
    if (query[key] == null) delete query[key]
  })

  router.push({ query })
}


onMounted(async () => {
  await nextTick()

  const pageFromUrl = route.query.page
  if (pageFromUrl) {
    const numPage = Number(pageFromUrl)
    if (!isNaN(numPage) && numPage > 0) {
      currentPage.value = numPage
    }
  }

  updateQuery()
  getPageRange()

  isInitialized.value = true
})
</script>

<style lang="scss" scoped>
.pagination-container {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 6px 0 100px 0;
  margin-inline: 20px;
  &__count-showElem {
    color: #686868;
    margin: 20px 0 0 20px;
  }
}
.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 20px 20px 0 0;
  &__btn {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;

    &.active {
      background-color: #024760;
      color: white;
      border-color: #024760;
    }

    &:hover:not(.active) {
      background-color: #f8f9fa;
    }
  }

  &__button {
    border: 1px solid #b8b8b8;
    border-radius: 2px;
    &:hover {
      opacity: 0.7;
    }
  }
}

button:disabled {
  cursor: not-allowed;
  &:hover {
    opacity: 1;
  }
}
</style>
