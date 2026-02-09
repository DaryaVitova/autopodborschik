<template>
  <div class="cards">
    <div class="cards__filters" v-if="showFilters">
      <div class="cards__filters--box1">
        <search-input
          class="cards__filters-input"
          v-model="searchBrand"
          :placeholder="'Марка'"
          @input="handleSearch"
          @close-click="resetFilter('searchBrand')"
        />

        <search-input
          v-model="searchModel"
          :placeholder="'Модель'"
          @input="handleSearch"
          @close-click="resetFilter('searchModel')"
        />
      </div>

      <div class="cards__filters--box2">
        <div class="cards__filters-inputs">
          <search-input
            v-model="searchCity"
            :placeholder="'Город'"
            @input="handleSearch"
            @close-click="resetFilter('searchCity')"
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
            <custom-select-year
              class="cards__search cards__search--change-width cards__search--one"
              v-model="startYear"
              placeholderText="Год от"
              :changeTextColor="true"
              :disabled-after="endYear"
            />
          </div>

          <div class="cards__search--input-group">
            <custom-select-year
              class="cards__search cards__search--change-width cards__search--two"
              v-model="endYear"
              placeholderText="до"
              :changeTextColor="true"
              :disabled-before="startYear"
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

    <pagination-views
      class="cards__pagination"
      v-show="!loader"
      :data="filteredData"
      :column-per-page="9"
      @changePage="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
//  pattern="[0-9\s]*"
import PaginationViews from '@/components/common/PaginationViews.vue'
import CustomSelectYear from '@/components/common/CustomSelectYear.vue'
import CarCard from '@/components/Cards/CarCard.vue'
import SearchInput from '@/components/Cards/SearchInput.vue'
import SearchInputByNumber from '@/components/Cards/SearchInputByNumber.vue'
import { useRoute, useRouter } from 'vue-router'
import { computed, reactive, ref, watch, onMounted } from 'vue'
import type { Advertisement } from "@/composables/useAdvertisements"

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
  (e: 'search', query: string | null): void,
  (e: 'showSoldAuto', item: boolean): void
}>()

interface FilterPrice {
  localMinPrice: number | null,
  localMaxPrice: number | null,
  activeMinPrice: number | null,
  activeMaxPrice: number | null
}

interface FilterMileage {
  localMinMileage: number | null,
  localMaxMileage: number | null,
  activeMinMileage: number | null,
  activeMaxMileage: number | null
}

const router = useRouter()
const route = useRoute()

const startYear = ref<number | null>(null)
const endYear = ref<number | null>(null)

const currentPageItems = ref<Advertisement[]>([])

const currentQuery = ref<string | null>(null)

const searchError = ref<boolean>(false)

const searchModel = ref<string>('')
const searchBrand = ref<string>('')
const searchCity = ref<string>('')

const toggleSoldAuto = ref<boolean>(false)

const dataFilterPrice = reactive<FilterPrice>({
  localMinPrice: null,
  localMaxPrice: null,
  activeMinPrice: null,
  activeMaxPrice: null
})

const dataFilterMileage = reactive<FilterMileage>({
  localMinMileage: null,
  localMaxMileage: null,
  activeMinMileage: null,
  activeMaxMileage: null
})

type ResetKey = 'minPrice' | 'maxPrice'
  | 'minMileage' | 'maxMileage' |
  'searchBrand' | 'searchModel' | 'searchCity'

const filteredData = computed((): Advertisement[] => {
  if (
    !searchBrand.value.trim()
    && !searchModel.value.trim()
    && !searchCity.value.trim()
    && dataFilterPrice.activeMinPrice === null
    && dataFilterPrice.activeMaxPrice === null
    && !startYear.value && !endYear.value
    && dataFilterMileage.activeMinMileage === null
    && dataFilterMileage.activeMaxMileage === null) {
    return props.data
  }

  const brandQuery = searchBrand.value.toLowerCase().trim()
  const modelQuery = searchModel.value.toLowerCase().trim()
  const cityQuery = searchCity.value.toLowerCase().trim()

  return props.data.filter(item => {
    const textConditions = []

    if (brandQuery) {
      textConditions.push(item.brand?.toLowerCase().includes(brandQuery))
    }
    if (modelQuery) {
      textConditions.push(item.model?.toLowerCase().includes(modelQuery))
    }
    if (cityQuery) {
      textConditions.push(item.city?.toLowerCase().includes(cityQuery))
    }

    let pricePasses = true
    const price = item.price || 0

    if (dataFilterPrice.activeMinPrice !== null) {
      pricePasses = pricePasses && (price >= dataFilterPrice.activeMinPrice)
    }

    if (dataFilterPrice.activeMaxPrice !== null) {
      pricePasses = pricePasses && (price <= dataFilterPrice.activeMaxPrice)
    }

    let yearPasses = true

    if (startYear.value !== null) {
      yearPasses = yearPasses && (item.year >= startYear.value)
    }

    if (endYear.value !== null) {
      yearPasses = yearPasses && (item.year <= endYear.value)
    }

    let mileagePasses = true
    const mileage = item.mileage || 0

    if (dataFilterMileage.activeMinMileage !== null) {
      mileagePasses = mileagePasses && (mileage >= dataFilterMileage.activeMinMileage)
    }

    if (dataFilterMileage.activeMaxMileage!== null) {
      mileagePasses = mileagePasses && (mileage <= dataFilterMileage.activeMaxMileage)
    }

    const textPassed = textConditions.length > 0
      ? textConditions.every(cond => cond)
      : true

    return textPassed && pricePasses && yearPasses && mileagePasses
  })
})

watch(() => toggleSoldAuto.value, (newVal) => {
  const query = { ...route.query }

  if (newVal) {
    query.showSold = 'true'
  } else {
    delete query.showSold
  }

  router.push({ query })

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

  // Преобразуем числа в строки для query параметров
  if (min !== null && min !== undefined) {
    query.year_from = min.toString()
  } else {
    delete query.year_from
  }

  if (max !== null && max !== undefined) {
    query.year_to = max.toString()
  } else {
    delete query.year_to
  }

  pushQuery(query)
})


function pushQuery(query: Record<string, string | string[]>): void {
  router.push({
    name: 'cards',
    query: query
  })
}

function applyPriceFilter(): void {
  const query = { ...route.query } as Record<string, string | string[]>

  if (dataFilterPrice.localMinPrice) {
    dataFilterPrice.activeMinPrice = dataFilterPrice.localMinPrice
    query.price_from = (dataFilterPrice.activeMinPrice).toString()
  }
  if (dataFilterPrice.localMaxPrice) {
    dataFilterPrice.activeMaxPrice = dataFilterPrice.localMaxPrice
    query.price_to = (dataFilterPrice.activeMaxPrice).toString()
  }

  pushQuery(query)
}

function applyMileageFilter(): void {
  const query = { ...route.query } as Record<string, string | string[]>

  if (dataFilterMileage.localMinMileage) {
    dataFilterMileage.activeMinMileage = dataFilterMileage.localMinMileage
    query.mileage_from = (dataFilterMileage.activeMinMileage).toString()
  }
  if (dataFilterMileage.localMaxMileage) {
    dataFilterMileage.activeMaxMileage = dataFilterMileage.localMaxMileage
    query.mileage_to = (dataFilterMileage.activeMaxMileage).toString()
  }

  pushQuery(query)
}

function resetFilter(arg: ResetKey): void {
  const query = { ...route.query } as Record<string, string | string[]>

  switch(arg) {
    case 'minPrice':
      dataFilterPrice.localMinPrice = null
      dataFilterPrice.activeMinPrice = null
      delete query.price_from
      break

    case 'maxPrice':
      dataFilterPrice.localMaxPrice = null
      dataFilterPrice.activeMaxPrice = null
      delete query.price_to
      break

    case 'minMileage':
      dataFilterMileage.localMinMileage = null
      dataFilterMileage.activeMinMileage = null
      delete query.mileage_from
      break

    case 'maxMileage':
      dataFilterMileage.localMaxMileage = null
      dataFilterMileage.activeMaxMileage = null
      delete query.mileage_to
      break

    case 'searchBrand':
      searchBrand.value = ''
      delete query.brand
      break

    case 'searchModel':
      searchModel.value = ''
      delete query.model
      break

    case 'searchCity':
      searchCity.value = ''
      delete query.city
      break
  }

  pushQuery(query)
}

function handlePageChange (items: Advertisement[]): void {
  currentPageItems.value = items
}

const handleSearch = () => {
  const query = { ...route.query } as Record<string, string | string[]>

  searchBrand.value.trim() ? query.brand = searchBrand.value : delete query.brand
  searchModel.value.trim() ? query.model = searchModel.value : delete query.model
  searchCity.value.trim() ? query.city = searchCity.value : delete query.city

  pushQuery(query)

  emit('search', currentQuery.value)
}

const handleCardClick = (item: Advertisement) => {
  emit('card-click', item, toggleSoldAuto.value)
}

onMounted(() => {
  toggleSoldAuto.value = route.query.showSold === 'true'
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;
.cards {
  //width: 100vw;
  //max-width: 80%;
  //width: 100%;
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
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
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
      right: -95px;
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

  //&__checkbox {
  //  align-self: end;
  //  display: flex;
  //  justify-content: center;
  //  align-items: center;
  //  gap: 5px;
  //  &--mark {
  //    width: 18px;
  //    height: 18px;
  //    cursor: pointer;
  //  }
  //}

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
      border-radius: 10px 0 0 10px;
      appearance: textfield;
    }

    &--two {
      border-radius: 0 10px 10px 0;
    }

    //&--color {
    //  background-color: #cee3ed;
    //}

    //&:focus {
    //  outline: none;
    //  border-color: #5296bc;
    //  box-shadow: 0 0 0 3px rgba(82, 150, 188, 0.1);
    //}
  }

  &__pagination {
    margin-top: 30px;
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
    border-top-color: #5296bc;
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

// Адаптивность
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .car-card__photo {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .car-card__photo {
    height: 160px;
  }

  .car-card__price {
    font-size: 14px;
    padding: 6px 12px;
  }
}
</style>
