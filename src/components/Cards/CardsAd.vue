<template>
  <div class="cards">
    <div class="cards__filters" v-if="showFilters">
      <div class="cards__filters--box1">
        <search-input
          class="cards__filters-input"
          v-model="searchBrand"
          :placeholder="'Марка'"
          @input="handleSearch"
        />

        <search-input
          v-model="searchModel"
          :placeholder="'Модель'"
          @input="handleSearch"
        />
      </div>

      <div class="cards__filters--box2">
        <div class="cards__filters-inputs">
          <search-input
            v-model="searchCity"
            :placeholder="'Город'"
            @input="handleSearch"
          />

          <div class="cards__search-filter">
            <search-input-by-number
              v-model="dataFilterPrice.localMinPrice"
              :input-class="'cards__search cards__search--change-width cards__search--one'"
              :active="!!dataFilterPrice.activeMinPrice"
              :placeholder="'Цена от, ₽'"
              @close-click="resetFilter('minPrice')"
            />

            <search-input-by-number
              v-model="dataFilterPrice.localMaxPrice"
              :input-class="'cards__search cards__search--change-width cards__search--two'"
              :active="!!dataFilterPrice.activeMaxPrice"
              :placeholder="'до'"
              @close-click="resetFilter('maxPrice')"
            />
          </div>
        </div>
        <button
          class="cards__filter-btn cards__filter-btn--price"
          type="button"
          @click="applyPriceFilter"
        >
          Показать
        </button>
      </div>


      <div class="cards__filters--box3">
        <div class="cards__search-filter">
          <div class="cards__search--input-group">
            <CustomSelectYear
              class="cards__search cards__search--change-width cards__search--one"
              v-model="startYear"
              placeholderText="Год от"
              :changeTextColor="true"
              :disabled-after="endYear"
              :isOpen="isOpenFirstSelect"
              @toggle="handleToggle('start')"
              @close="openSelect = null"
            />
          </div>

          <div class="cards__search--input-group">
            <CustomSelectYear
              class="cards__search cards__search--change-width cards__search--two"
              v-model="endYear"
              placeholderText="до"
              :changeTextColor="true"
              :disabled-before="startYear"
              :isOpen="isOpenSecondSelect"
              @toggle="handleToggle('end')"
              @close="openSelect = null"
            />
          </div>
        </div>

        <div class="cards__search-filter">
          <search-input-by-number
            v-model="dataFilterMileage.localMinMileage"
            :input-class="'cards__search cards__search--change-width cards__search--one'"
            :active="!!dataFilterMileage.activeMinMileage"
            :placeholder="'Пробег от, км'"
            @close-click="resetFilter('minMileage')"
          />

          <search-input-by-number
            v-model="dataFilterMileage.localMaxMileage"
            :input-class="'cards__search cards__search--change-width cards__search--two'"
            :active="!!dataFilterMileage.activeMaxMileage"
            :placeholder="'до'"
            @close-click="resetFilter('maxMileage')"
          />
          <button
            class="cards__filter-btn cards__filter-btn--mileage"
            type="button"
            @click="applyMileageFilter"
          >
            Показать
          </button>
        </div>
      </div>
    </div>

    <!-- Карточки -->
    <div v-if="!loader" class="cards__grid">
      <div class="cards__checkbox">
        <input
          type="checkbox"
          v-model="toggleSoldAuto"
          id="checkbox"
          class="cards__checkbox--mark"
        />
        <label for="checkbox">Показать проданные</label>
      </div>

      <car-card
        v-for="item in currentPageItems"
        :key="item.id"
        :item="item"
        :highlight-brand="searchBrand"
        :highlight-model="searchModel"
        :highlight-city="searchCity"
        @card-click="handleCardClick"
      />
    </div>

    <!-- Нет данных -->
    <div v-if="searchError" class="cards-empty">
      <div class="empty-icon">🚗</div>
      <p class="empty-text">Нет объявлений</p>
      <p class="empty-subtext" v-if="currentQuery">
        По запросу "{{ currentQuery }}" ничего не найдено
      </p>
    </div>

    <!-- Загрузка -->
    <div v-if="loader" class="cards-loading">
      <div class="loading-spinner"></div>
      <p>Загрузка объявлений...</p>
    </div>

    <PaginationViews
      class="cards__pagination"
      v-show="!loader"
      :data="filteredData"
      :is-filtering="isFiltering"
      :isNavigating="isNavigating"
      :isRestoringFromBack="isRestoringFromBack"
      :column-per-page="9"
      @changePage="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import CarCard from '@/components/Cards/CarCard.vue'
import SearchInput from '@/components/Cards/SearchInput.vue'
import SearchInputByNumber from '@/components/Cards/SearchInputByNumber.vue'
import { useRoute, useRouter } from 'vue-router'
import { computed, watch, onMounted, nextTick, ref } from 'vue'
import type { Advertisement } from "@/composables/advertisements.ts"
import { useFilterState } from "@/composables/FiltersCards/filterCardsState.ts"
import { useFilterDataCards } from "@/composables/FiltersCards/filterDataCards.ts";
import { useFilterOperationsCards } from "@/composables/FiltersCards/filterOperationsCards.ts";

const props = withDefaults(defineProps<{
  data: Advertisement[],
  loader: boolean,
  showFilters?: boolean
}>(), {
  loader: false,
  showFilters: true,
})

const emit = defineEmits<{
  (e: 'card-click', item: Advertisement, showSold: boolean): void,
  (e: 'showSoldAuto', item: boolean): void
}>()

const router = useRouter()
const route = useRoute()

const openSelect = ref<string | null>(null)

const filterState = useFilterState()
const {
  searchBrand, searchModel, searchCity,
  startYear, endYear,
  dataFilterPrice, dataFilterMileage,
  currentQuery, searchError,
  toggleSoldAuto, currentPageItems,
  isFiltering, isNavigating, isRestoringFromBack,
  savedPageBeforeFilterData
} = filterState

const filteredData = useFilterDataCards(
  computed(() => props.data),
  searchBrand, searchModel, searchCity,
  dataFilterPrice, dataFilterMileage,
  startYear, endYear
)

const { resetFilter, applyPriceFilter, applyMileageFilter, handleSearch, savePage } = useFilterOperationsCards(
  searchBrand, searchModel, searchCity,
  dataFilterPrice, dataFilterMileage,
  savedPageBeforeFilterData,
  isFiltering,
  pushQuery,
  hasOnlyPageAndCount
)

watch(() => toggleSoldAuto.value, (newVal) => {
  const query = { ...route.query } as Record<string, string | string[]>

  if (newVal) {
    query.showSold = 'true'
    console.log(query, 'query toggleSoldAuto')
    savePage(query)
  } else {
    delete query.showSold
    checkSavedPage()
  }

  function checkSavedPage () {
    if (savedPageBeforeFilterData.value) {
      query.page = savedPageBeforeFilterData.value
      console.log(query.page, 'query.page checkSavedPage')
    }

    if (hasOnlyPageAndCount(query)) {
      console.log('hasOnlyPageAndCount')
      savedPageBeforeFilterData.value = null
      sessionStorage.removeItem('savedPageBeforeFilter')
    }
  }

  pushQuery(query)

  emit('showSoldAuto', newVal)
})


watch(() => route.query, (newQuery) => {
  searchModel.value = newQuery.model as string || ''
  searchBrand.value = newQuery.brand as string || ''
  searchCity.value = newQuery.city as string || ''
  startYear.value = Number(newQuery.year_from) || null
  endYear.value = Number(newQuery.year_to) || null

  const numericFields = [
    { key: 'price_from', target: dataFilterPrice, props: ['localMinPrice', 'activeMinPrice'] },
    { key: 'price_to', target: dataFilterPrice, props: ['localMaxPrice', 'activeMaxPrice'] },
    { key: 'mileage_from', target: dataFilterMileage, props: ['localMinMileage', 'activeMinMileage'] },
    { key: 'mileage_to', target: dataFilterMileage, props: ['localMaxMileage', 'activeMaxMileage'] }
  ]

  numericFields.forEach(({ key, target, props }) => {
    if (newQuery[key]) {
      const value = Number(newQuery[key])
      props.forEach(prop => (target as Record<string, number | null>)[prop] = value)
    } else {
      props.forEach(prop => (target as Record<string, number | null>)[prop] = null)
    }
  })
}, { immediate: true })

watch(
  [
    () => searchBrand.value,
    () => searchModel.value,
    () => searchCity.value
  ],
  ([brand, model, city]) => {
    const nonEmpty = [brand, model, city].filter(value => value.trim() !== '')
    currentQuery.value = nonEmpty.length > 0 ? nonEmpty.join(' ') : null
  }
)

watch(() => searchBrand.value, (newValue, oldValue) => {
  if (newValue === '' && oldValue !== '') {
    resetFilter('searchBrand')
  }
})

watch(() => searchModel.value, (newValue, oldValue) => {
  if (newValue === '' && oldValue !== '') {
    console.log('watch searchModel')
    resetFilter('searchModel')
  }
})

watch(() => searchCity.value, (newValue, oldValue) => {
  if (newValue === '' && oldValue !== '') {
    resetFilter('searchCity')
  }
})


watch(() => [dataFilterPrice.localMinPrice, dataFilterPrice.localMaxPrice],
  ([min, max]) => {
    if (min === null) dataFilterPrice.activeMinPrice = null
    if (max === null) dataFilterPrice.activeMaxPrice = null
  }
)

watch(() => [dataFilterMileage.localMinMileage, dataFilterMileage.localMaxMileage],
  ([min, max]) => {
    if (min === null) dataFilterMileage.activeMinMileage = null
    if (max === null) dataFilterMileage.activeMaxMileage = null
  }
)

watch(() => filteredData.value, () => {
  searchError.value = filteredData.value.length === 0
})

watch([startYear, endYear], ([min, max]) => {
  const query = { ...route.query } as Record<string, string | string[]>

  function checkSavedPage () {
    if (savedPageBeforeFilterData.value) {
      query.page = savedPageBeforeFilterData.value
    }

    if (hasOnlyPageAndCount(query)) {
      savedPageBeforeFilterData.value = null
      sessionStorage.removeItem('savedPageBeforeFilter')
    }
  }

  // Преобразуем числа в строки для query параметров
  if (min !== null && min !== undefined) {
    savePage(query)
    query.year_from = min.toString()
  } else {
    checkSavedPage()

    delete query.year_from
  }

  if (max !== null && max !== undefined) {
    savePage(query)
    query.year_to = max.toString()
  } else {
    checkSavedPage()

    delete query.year_to
  }

  pushQuery(query)
})

const isOpenFirstSelect = computed(() => {
  return openSelect.value === 'start'
})

const isOpenSecondSelect = computed(() => {
  return openSelect.value === 'end'
})

function handleToggle (selectId: string) {
  openSelect.value = openSelect.value === selectId ? null : selectId
}

async function pushQuery(query: Record<string, string | string[]>): Promise<void> {
  isNavigating.value = true

  await router.push({
    name: 'cards',
    query: query
  })

  await nextTick()

  isNavigating.value = false
}

function hasOnlyPageAndCount(query: Record<string, any>): boolean {
  const keys = Object.keys(query)

  if (keys.length === 0) return false

  return keys.every(key => key === 'page' || key === 'count')
}

function handlePageChange (items: Advertisement[]): void {
  currentPageItems.value = items
}

const handleCardClick = (item: Advertisement) => {
  emit('card-click', item, toggleSoldAuto.value)

  setTimeout(() => {
    isRestoringFromBack.value = false
  }, 2000)
}

onMounted(() => {
  toggleSoldAuto.value = route.query.showSold === 'true'

  const savedQuery = sessionStorage.getItem('cards-query')
  if (savedQuery) {
    isRestoringFromBack.value = true
    const query = JSON.parse(savedQuery)

    router.replace({ query })

    setTimeout(() => {
      isRestoringFromBack.value = false
      sessionStorage.removeItem('cards-query')
    }, 500)
  }

  const saved = sessionStorage.getItem('savedPageBeforeFilter')
  if (saved) {
    savedPageBeforeFilterData.value = saved
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;
.cards {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 60px auto 80px auto;
  padding: 0 20px;
  &__filters {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 70px;
    gap: 20px;
    &--box1, &--box3 {
      display: flex;
      gap: 20px;
    }
    &--box2 {
      position: relative;
    }

    &-inputs {
      display: flex;
      gap: 20px;
      align-items: center;
    }
  }

  &__filter-btn {
    text-decoration: none;
    padding: 5px 8px;
    font-size: 14px;
    border: none;
    border-radius: var(--border-radius-sm);
    background-color: #438eb8;
    color: white;
    &:hover {
      background-color: #5793c8;
      transition-duration: 0.2s;
      opacity: 0.8;
    }
    &--price, &--mileage {
      position: absolute;
      z-index: 1;
      top: 50%;
      right: -90px;
      transform: translateY(-50%);
    }
  }
  &__grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px;
    width: 820px;
  }

  &__checkbox {
    @include checkbox;
  }

  &__search {
    @include cards-search-styles;

    &-filter {
      position: relative;
      display: flex;
      align-items: center;
    }

    &--input-group {
      position: relative;
    }

    &--close-filter {
      @include close-filter-styles;
    }

    &--change-width {
      width: calc(280px / 2);
    }

    &--one {
      border-radius: var(--border-radius-lg) 0 0 var(--border-radius-lg);
      appearance: textfield;
    }

    &--two {
      border-radius: 0  var(--border-radius-lg) var(--border-radius-lg) 0;
    }
  }

  &__pagination {
    margin-top: 50px !important;
  }
}

// Состояния
.cards-empty {
  text-align: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 18px;
    color: #6b7280;
    margin-bottom: 10px;
  }

  .empty-subtext {
    font-size: 14px;
    color: #9ca3af;
  }
}

.cards-loading {
  text-align: center;
  padding: 60px 20px;

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #f3f4f6;
    border-top-color: var(--color-middle-blue);
    border-radius: 50%;
    margin: 0 auto 20px;
    animation: spin 1s linear infinite;
  }

  p {
    color: #6b7280;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1023px) {
  .cards {
    padding: 0;

    &__grid {
      width: 700px;
    }

    &__filter-btn {
      padding: 4px 5px;
      font-size: 10px;
      &--price, &--mileage {
        right: -60px;
      }
    }
  }
}
@media (max-width: 768px) {
  .cards {
    &__search {
      &--change-width {
        width: calc(250px / 2);
      }
    }

    &__grid {
      width: 600px;
    }
  }
  .car-card__photo {
    height: 180px;
  }
}

@media (max-width: 660px) {
  .cards {
    margin: 60px auto 40px auto;
    &__search {
      font-size: 12px;
      &--change-width {
        width: calc(200px / 2);
      }
    }
    &__grid {
      width: 500px;
    }

    &__checkbox label {
      font-size: 14px;
    }

    &__checkbox--mark {
      width: 16px;
      height: 16px;
    }
  }
}

@media (max-width: 600px) {
  .cards {
    &__grid {
      justify-content: center;
      width: 300px;
      padding-inline: 20px;
    }
    &__filters {
      &--box1, &-inputs, &--box3 {
        flex-direction: column;
        align-items: center;
      }
    }

    &__filter-btn {
      padding: 3px 4px;
      font-size: 8px;
      border-radius: 4px;
      right: -50px;
      &--price {
        top: 90px;
      }
    }

    &__checkbox {
      align-self: center;
    }
  }
}

@media (max-width: 480px) {
  .car-card__photo {
    height: 160px;
  }

  .car-card__price {
    font-size: 14px;
    padding: 6px 12px;
  }
}
</style>
