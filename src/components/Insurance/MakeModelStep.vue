<template>
  <div class="car-search">
    <div class="car-search__input-group">
      <Search class="car-search__loupe" :size="20" />
      <input
        class="car-search__input"
        v-model="inputValue"
        @input="handleInput"
        ref="inputRef"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        type="text"
        placeholder="Введите название автомобиля"
      />
      <Check v-if="isShowMarkIcon" class="car-search__check" :size="20" />
      <button
        v-else-if="inputValue"
        type="button"
        class="car-search__clear"
        aria-label="Очистить"
        @click="cleanInput"
      >
        <X :size="18" />
      </button>

      <Transition name="drop">
        <div
          v-if="listOfSuitableCars.length > 0 && isShowListOfSuitable"
          class="car-search__suggest"
        >
          <div
            v-for="car in listOfSuitableCars"
            :key="car"
            class="car-search__suggest-item"
            v-html="useHighlightText(car, inputValue)"
            @mousedown.prevent="carSelected(car)"
          ></div>
        </div>
      </Transition>
    </div>

    <div class="car-search__divider"><span>или выберите из списка</span></div>

    <div class="car-search__tabs-wrap">
      <SegmentedControl
        class="car-search__tabs"
        aria-label="Выбор по марке или модели"
        :options="tabOptions"
        :model-value="isActiveTab"
        @update:model-value="onTabChange"
      />
      <Transition name="drop">
        <span v-if="errorMsg" class="car-search__tabs-error">Сначала выберите марку</span>
      </Transition>
    </div>

    <div v-if="isActiveTab === 'make'" class="car-list">
      <div v-for="group in groupedBrands" :key="group.letter" class="car-list__group">
        <span class="car-list__letter">{{ group.letter }}</span>
        <div class="car-list__items">
          <a
            v-for="brand in group.brands"
            :key="brand"
            class="car-list__item"
            :class="{ 'car-list__item--active': activeBrand === brand && isShowMarkIcon }"
            @click="openModels(brand)"
          >
            {{ brand }}
          </a>
        </div>
      </div>
    </div>

    <div v-if="activeBrand && isActiveTab === 'model'" class="car-models">
      <a
        class="car-list__item"
        v-for="model in dataCars[activeBrand].models"
        :class="{ 'car-list__item--active': activeModel === model && isShowMarkIcon }"
        :key="model"
        @click="modelSelection(model)"
      >
        {{ model }}
      </a>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { Search, Check, X } from "@lucide/vue"
import { ref, computed, watch } from "vue"
import SegmentedControl from "@/components/ui/SegmentedControl.vue"
import { dataCars } from "@/data/CarMakeModelData.ts"
import { dataCarsKeys } from "@/data/CarMakeModelData.ts"
import type { CarBrandType } from "@/data/CarMakeModelData.ts"
import type { CarModelType } from "@/data/CarMakeModelData.ts"
import { useHighlightText } from "@/composables/highlightText.ts"

const emit = defineEmits<{
  (e: 'MakeModelValue', value: string): void
}>()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const isActiveTab = ref<'make' | 'model'>('make')
const activeBrand = ref<CarBrandType | null>(null)
const activeModel = ref<CarModelType<NonNullable<typeof activeBrand.value>> | null>(null)
const errorMsg = ref<boolean>(false)

const isShowMarkIcon = ref<boolean>(false)
const isShowListOfSuitable = ref<boolean>(false)

const listOfSuitableCars = ref<string[]>([])

const tabOptions = [
  { value: 'make', label: 'Марка' },
  { value: 'model', label: 'Модель' }
]

const groupedBrands = computed(() => {
  const groups: Record<string, CarBrandType[]> = {}

  const sortedBrands = [...dataCarsKeys].sort()

  sortedBrands.forEach(brand => {
    const letter = brand.charAt(0).toUpperCase()
    if (!groups[letter]) {
      groups[letter] = []
    }
    groups[letter].push(brand as CarBrandType)
  })

  return Object.entries(groups).map(([letter, brands]) => ({
    letter,
    brands
  }))
})

watch(() => inputValue.value, (newVal) => {
  listOfSuitableCars.value = []

  if (newVal.length < 2 ) {
    return
  }

  let suitableBrands = dataCarsKeys.filter((brand): brand is CarBrandType => {
    return (brand.toLowerCase() + ' ') .startsWith(newVal.toLowerCase())
  })

  if (suitableBrands.length === 0) {
    suitableBrands = dataCarsKeys.filter((brand): brand is CarBrandType => {
      return (brand.toLowerCase() + ' ').includes(newVal.toLowerCase())
    })
  }

  if (suitableBrands.length > 0) {
    suitableBrands.forEach((brand: CarBrandType) => {
      let models = dataCars[brand].models

      const sliceLength: Record<number, number> = {
        1: models.length,
        2: 15,
        3: 10,
        4: 7,
        5: 6
      }

      const maxLength = sliceLength[suitableBrands.length]
      models = maxLength ? models.slice(0, maxLength) : models

      if (models.length > 30) models = models.slice(0, 31)

      models.forEach((model: CarModelType<typeof brand>) => {
        listOfSuitableCars.value.push(`${brand} ${model}`)
      })
    })
  }

  if (suitableBrands.length === 0) {
    listOfSuitableCars.value = searchModelsPrioritized(newVal)
  }
})

function onTabChange(value: string | undefined) {
  if (value === 'model' && activeBrand.value === null) {
    errorMsg.value = true
    return
  }
  errorMsg.value = false
  isActiveTab.value = value as 'make' | 'model'
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  target.value = target.value.trimStart()
  inputValue.value = target.value
}

function searchModelsPrioritized(searchVal: string): string[] {
  let lowerVal = searchVal.toLowerCase()
  const results = { startsWith: [] as string[], includes: [] as string[] }

  const processModel = (model: string, brand: string) => {
    if (model.toLowerCase().startsWith(lowerVal)) {
      results.startsWith.push(`${brand} ${model}`)
    } else if (model.toLowerCase().includes(lowerVal)) {
      results.includes.push(`${brand} ${model}`)
    }
  }

  for (const [brand, { models }] of Object.entries(dataCars)) {
    const lowerBrand = brand.toLowerCase()

    if (lowerVal.includes(lowerBrand)) {
      lowerVal = lowerVal.slice(lowerBrand.length + 1)
      models.forEach((model) => processModel(model, brand))
      break
    }

    models.forEach((model) => processModel(model, brand))
  }

  return [...results.startsWith, ...results.includes].slice(0, 30)
}

function cleanInput() {
  inputValue.value = ''
  isActiveTab.value = 'make'
  activeBrand.value = null
}

function handleInputBlur() {
  isShowListOfSuitable.value = false
}

function handleInputFocus() {
  isShowListOfSuitable.value = true
  isShowMarkIcon.value = false
  emit('MakeModelValue','')
}

function openModels(brand: CarBrandType) {
  inputValue.value = ''
  emit('MakeModelValue','')
  activeBrand.value = brand
  isActiveTab.value = 'model'
  errorMsg.value = false
}

function modelSelection(model: CarModelType<NonNullable<typeof activeBrand.value>>) {
  activeModel.value = model
  inputValue.value = `${activeBrand.value} ${model}`
  isShowMarkIcon.value = true
  emit('MakeModelValue', inputValue.value)
}

function carSelected(car: string) {
  const spaceIndex = car.indexOf(' ')
  const makeModel = [car.slice(0, spaceIndex), car.slice(spaceIndex + 1)]

  if(makeModel[0]) activeBrand.value = makeModel[0] as CarBrandType
  if (makeModel[1]) activeModel.value = makeModel[1]

  inputValue.value = car
  isShowMarkIcon.value = true
  inputRef.value?.blur()
  emit('MakeModelValue', inputValue.value)
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.car-search {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__input-group {
    width: 100%;
    max-width: 520px;
    position: relative;
  }

  &__input {
    width: 100%;
    box-sizing: border-box;
    height: 56px;
    padding: 0 var(--space-12) 0 var(--space-12);
    background: var(--surface);
    color: var(--ink);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-pill);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    text-overflow: ellipsis;
    transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);

    &::placeholder {
      color: var(--ink-faint);
    }
    &:hover {
      border-color: var(--ink-faint);
    }
    &:focus {
      outline: none;
      border-color: var(--primary);
      @include focus-ring;
    }
  }

  &__loupe {
    position: absolute;
    left: var(--space-5);
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary);
    pointer-events: none;
    z-index: 1;
  }
  &__check {
    position: absolute;
    right: var(--space-5);
    top: 50%;
    transform: translateY(-50%);
    color: var(--success);
    z-index: 1;
  }
  &__clear {
    position: absolute;
    right: var(--space-4);
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: var(--surface-3);
    color: var(--ink-muted);
    cursor: pointer;
    z-index: 1;
    transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
    &:hover {
      background: var(--danger-soft);
      color: var(--danger);
    }
  }

  &__suggest {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: var(--z-dropdown);
    max-height: 300px;
    overflow-y: auto;
    padding: var(--space-2);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);

    &-item {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--ink);
      transition: background-color var(--dur-fast) var(--ease);
      &:hover {
        background: var(--surface-3);
      }
    }
  }

  &__divider {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 520px;
    margin: var(--space-8) 0 var(--space-6);
    color: var(--ink-faint);
    font-size: var(--text-sm);

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    span {
      padding: 0 var(--space-4);
    }
  }

  &__tabs-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }
  &__tabs {
    width: 280px;
    max-width: 100%;
  }
  &__tabs-error {
    color: var(--danger);
    font-size: var(--text-sm);
  }
}

.car-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8) var(--space-6);
  width: 100%;
  margin-top: var(--space-10);

  &__group {
    display: flex;
    gap: var(--space-3);
  }
  &__letter {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--primary);
    line-height: 1.4;
  }
  &__items {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }
  &__item {
    width: fit-content;
    color: var(--ink);
    cursor: pointer;
    border-bottom: 1px solid transparent;
    transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
    &:hover {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    &--active {
      color: var(--primary);
      font-weight: 600;
    }
  }
}

.car-models {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  gap: var(--space-4) var(--space-6);
  margin-top: var(--space-10);
}

@include mobile {
  .car-list,
  .car-models {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5) var(--space-4);
    margin-top: var(--space-8);
  }
  .car-search__input {
    height: 52px;
  }
}

:deep(.highlight) {
  background: var(--primary-soft);
  color: var(--primary-hover);
  padding: 1px 3px;
  border-radius: 4px;
  font-weight: 600;
}
</style>
