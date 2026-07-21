<template>
  <div class="car-data">
    <div class="car-data__field">
      <label class="car-data__label">VIN номер</label>
      <input
        v-model="vin"
        @input="handleVinInput"
        class="car-data__input"
        placeholder="XTA219060N0090511"
        maxlength="17"
      />
      <span v-if="vinError" class="car-data__error">VIN должен содержать 17 символов</span>
    </div>

    <div class="car-data__field">
      <label class="car-data__label">Гос. номер</label>
      <input
        v-model="plateNumber"
        @input="handlePlateInput"
        class="car-data__input"
        placeholder="А123БВ777"
        maxlength="9"
      />
    </div>

    <div class="car-data__field">
      <label class="car-data__label">Год выпуска</label>
      <input
        :value="year ?? ''"
        @input="handleYearInput"
        type="number"
        class="car-data__input"
        placeholder="2020"
      />
      <span v-if="yearError" class="car-data__error">Некорректный год выпуска</span>
    </div>

    <div class="car-data__field">
      <label class="car-data__label">Мощность двигателя, л.с.</label>
      <input
        v-model.number="enginePower"
        type="number"
        class="car-data__input"
        placeholder="150"
      />
    </div>

    <div class="car-data__field">
      <label class="car-data__label">Категория ТС</label>
      <div
        class="car-data__select"
        :class="{ 'car-data__select--open': isCategoryOpen }"
        tabindex="0"
        @click="isCategoryOpen = !isCategoryOpen"
        @blur="isCategoryOpen = false"
      >
        <span :class="{ 'car-data__select-value--placeholder': !category }">
          {{ selectedCategoryLabel }}
        </span>
        <arrow-icon
          class="car-data__select-arrow"
          :class="{ 'car-data__select-arrow--open': isCategoryOpen }"
        />

        <div v-if="isCategoryOpen" class="car-data__select-dropdown">
          <div
            v-for="option in categoryOptions"
            :key="option.value"
            class="car-data__select-option"
            @mousedown.prevent="selectCategory(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed, watch } from "vue"
import ArrowIcon from "@/components/SvgIcons/ArrowIcon.vue"
import type { CarCategory } from "@/composables/insuranceCalculation.ts"

const emit = defineEmits<{
  (e: 'CarDataValid', value: boolean): void
  (e: 'CarDataUpdate', value: { enginePower: number | null, category: CarCategory | '' }): void
}>()

const vin = ref('')
const plateNumber = ref('')
const year = ref<number | null>(null)
const enginePower = ref<number | null>(null)
const category = ref<CarCategory | ''>('')

const categoryOptions: { value: CarCategory, label: string }[] = [
  { value: 'A', label: 'A — мотоцикл' },
  { value: 'B', label: 'B — легковой' },
  { value: 'C', label: 'C — грузовой' },
  { value: 'D', label: 'D — автобус' }
]

const isCategoryOpen = ref(false)

const selectedCategoryLabel = computed(() => {
  return categoryOptions.find(option => option.value === category.value)?.label ?? 'Выберите категорию'
})

function selectCategory(value: CarCategory) {
  category.value = value
  isCategoryOpen.value = false
}

const currentYear = new Date().getFullYear()

const vinError = computed(() => vin.value.length > 0 && vin.value.length !== 17)
const yearError = computed(() => {
  return year.value !== null && (year.value < 1950 || year.value > currentYear)
})

const isValid = computed(() => {
  return (
    vin.value.length === 17 &&
    plateNumber.value.trim().length > 0 &&
    year.value !== null && year.value >= 1950 && year.value <= currentYear &&
    enginePower.value !== null && enginePower.value > 0 &&
    category.value !== ''
  )
})

watch(isValid, (value) => {
  emit('CarDataValid', value)
}, { immediate: true })

watch([enginePower, category], () => {
  emit('CarDataUpdate', { enginePower: enginePower.value, category: category.value })
}, { immediate: true })

function handleVinInput(event: Event) {
  const target = event.target as HTMLInputElement
  vin.value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function handlePlateInput(event: Event) {
  const target = event.target as HTMLInputElement
  plateNumber.value = target.value.toUpperCase()
}

function handleYearInput(event: Event) {
  const target = event.target as HTMLInputElement
  year.value = target.value === '' ? null : Number(target.value)
}
</script>

<style lang="scss" scoped>
.car-data {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  width: 80%;
  margin-top: 60px;
  margin-bottom: 80px;

  &__field {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  &__label {
    margin-bottom: 8px;
    color: #504f4f;
  }

  &__input {
    border: 1px solid #bbb;
    padding: 12px 15px;
    border-radius: var(--border-radius-md);

    &:focus {
      outline: none;
      border-color: var(--color-middle-blue);
    }
  }

  &__select {
    --select-border-width: 1px;
    --select-border-color: #bbb;

    position: relative;
    display: flex;
    align-items: center;
    border: var(--select-border-width) solid var(--select-border-color);
    padding: 12px 40px 12px 15px;
    border-radius: var(--border-radius-md);
    background-color: #fff;
    cursor: pointer;

    &:focus {
      outline: none;
      --select-border-color: var(--color-middle-blue);
    }

    &--open {
      --select-border-color: var(--color-middle-blue);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    &-value--placeholder {
      color: #999999;
    }

    &-arrow {
      position: absolute;
      right: 28px;
      top: 50%;
      transform: translateY(-50%) rotate(90deg);
      color: var(--select-border-color);
      pointer-events: none;
      transition: transform 0.2s ease;

      &--open {
        transform: translateY(-50%) rotate(-90deg);
      }
    }

    &-dropdown {
      position: absolute;
      top: 100%;
      left: -1px;
      right: -1px;
      z-index: 100;
      background-color: #fff;
      border: var(--select-border-width) solid var(--select-border-color);
      border-top: none;
      border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
      overflow: hidden;
    }

    &-option {
      padding: 10px 15px;

      &:hover {
        background-color: #f4f4f4;
        transition-duration: 0.2s;
      }
    }
  }

  &__error {
    position: absolute;
    bottom: -20px;
    left: 0;
    font-size: 13px;
    color: #ec1518;
  }
}
</style>
