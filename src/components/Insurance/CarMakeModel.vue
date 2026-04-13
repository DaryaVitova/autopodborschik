<template>
  <div class="car-search">
    <div class="car-search__input-group">
      <loupe-icon class="car-search__input-icon car-search__input-icon--loupe" />
      <input
        class="car-search__input"
        v-model="inputValue"
        ref="inputRef"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        type="text"
        placeholder="Введите название автомобиля"
      />
      <check-mark-icon
        v-if="isShowMarkIcon"
        class="car-search__input-icon car-search__input-icon--mark"
      />

      <span
        v-if="inputValue && !isShowMarkIcon"
        class="car-search__input--close-filter"
        @click.stop="inputValue = ''"
      />

      <div
        v-if="listOfSuitableCars.length > 0 && isShowListOfSuitable"
        class="car-search__input-suitable-cars"
      >
        <div
          v-for="car in listOfSuitableCars"
          class="car-search__input-suitable-cars-item"
          v-html="useHighlightText(car, inputValue)"
          @mousedown.prevent="carSelected(car)"
        ></div>
      </div>
    </div>

    <div class="car-search__spacer-text">или выберете из списка</div>

    <div class="car-search__tabs">
      <div
        class="car-search__tab"
        :class="{ 'car-search__tab--active' :  isActiveTab === 'make' }"
        @click="clickMakeTab"
      >
        <span class="car-search__tab-text">Марка</span>
      </div>
      <div
        class="car-search__tab"
        :class="{ 'car-search__tab--active' :  isActiveTab === 'model' }"
        @click="clickModelTab"
      >
        <span class="car-search__tab-text">Модель</span>
      </div>

      <span v-if="errorMsg" class="car-search__tabs--error-msg">Сначала выберете марку</span>
    </div>

    <div v-if="isActiveTab === 'make'" class="car-list">
      <div v-for="group in groupedBrands" :key="group.letter" class="car-list-group">
        <span class="car-list-group__letter">{{ group.letter }}</span>
        <div class="car-list-group__items">
          <a
            v-for="brand in group.brands"
            :key="brand"
            class="car-list-group__item"
            :class="activeBrand === brand ? 'car-list-group__item--active' : ''"
            @click="openModels(brand)"
          >
            {{ brand }}
          </a>
        </div>
      </div>
    </div>

    <div v-if="activeBrand && isActiveTab === 'model'" class="car-models">
      <div
        class="car-models__model car-list-group__item"
        v-for="model in dataCars[activeBrand].models"
        :class="activeModel === model ? 'car-list-group__item--active' : ''"
        :key="model"
        @click="modelSelection(model)"
      >
        {{ model }}
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import LoupeIcon from "@/components/SvgIcons/LoupeIcon.vue"
import { ref, computed, watch } from "vue"
import { dataCars } from "@/data/CarMakeModelData.ts"
import { dataCarsKeys } from "@/data/CarMakeModelData.ts"
import type { CarBrandType } from "@/data/CarMakeModelData.ts"
import type { CarModelType } from "@/data/CarMakeModelData.ts"
import CheckMarkIcon from "@/components/SvgIcons/CheckMarkIcon.vue"
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

function clickMakeTab () {
  isActiveTab.value = 'make'
}

function clickModelTab () {
  if (activeBrand.value === null) {
    errorMsg.value = true
    return
  }
  errorMsg.value = false
  isActiveTab.value = 'model'
}

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
    letter, // сокращённая запись для { letter: letter, brands: brands }
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
  justify-content: center;
  align-items: center;
  margin-bottom: 80px;

  --border-radius-tab: 80px;

  &__input-group {
    width: 60%;
    position: relative;
    margin-top: 50px;
  }

  &__input {
    width: 100%;
    border: 1px solid #bbb;
    padding: 15px 10px 15px 60px;
    border-radius: 100px;
    text-overflow: ellipsis;
    position: relative;
    z-index: 200;

    &--close-filter {
      @include close-filter-styles;
      z-index: 300;
      right: 20px;
    }

    &:focus {
      outline: none;
      //box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2)
    }
    &::placeholder {
      color: #999999;
    }

    &-icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 300;

      &--loupe {
        left: 20px;
        color: var(--color-middle-blue);
      }

      &--mark {
        right: 20px;
        color: green;
      }
    }

    &-suitable-cars {
      position: absolute;
      display: flex;
      flex-direction: column;
      top: 85%;
      width: 100%;
      background-color: #fff;
      border-radius: 20px;
      z-index: 100;
      height: 300px;
      overflow-y: scroll;
      box-shadow: 0 0 0 2px rgba(108, 108, 108, 0.2);

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #fff;
        border-radius: 10px;
        margin-block: 12px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--color-light-blue);
        border-radius: 10px;
      }

      &-item {
        padding-block: 10px;
        padding-inline: 40px;
        &:first-child {
          margin-top: 20px;
        }
        &:last-child {
          margin-bottom: 25px;
        }

        &:hover {
          cursor: pointer;
          background-color: #f4f4f4;
          transition-duration: 0.2s;
        }
      }
    }
  }

  &__spacer-text {
    color: #999;
    margin: 30px 0;
  }

  &__tabs {
    position: relative;
    display: flex;
    border: 1px solid #286b8c;
    height: 50px;
    border-radius: var(--border-radius-tab);
    width: 40%;

    &--error-msg {
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      color: #ec1518;
    }
  }

  &__tab {
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      cursor: pointer;
    }

    &--active {
      background-color: var(--color-middle-blue);
      border-radius: var(--border-radius-tab);
      color: #fff;
    }
    &-text {
      padding-inline: 30px;
    }
  }
}

.car-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-top: 60px;

  &-group {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;

    &__items {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    &__letter {
      margin-right: 5px;
      font-size: 22px;
      font-weight: 500;
      color: var(--color-dark-blue);
    }

    &__item {
      border-bottom: 1px dashed #BDBDBDFF;
      width: fit-content;
      &:hover {
        color: var(--color-middle-blue);
        cursor: pointer;
        transition-duration: 0.2s;
      }

      &--active {
        color: var(--color-middle-blue);
      }
    }
  }
}

.car-models {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 90%;
  justify-items: center;
  gap: 25px;
  margin-top: 60px;
}

:deep(.highlight) {
  background-color: #d6e2f4;
  color: #333;
  padding: 2px 2px;
  border-radius: 4px;
  font-weight: 600;
  position: relative;
}
</style>
