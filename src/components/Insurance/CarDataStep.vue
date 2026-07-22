<template>
  <div class="car-data">
    <BaseInput
      v-model="vin"
      label="VIN номер"
      placeholder="XTA219060N0090511"
      mono
      :maxlength="17"
      :transform="normalizeVin"
      :error="vinError && 'VIN должен содержать 17 символов'"
    />

    <BaseInput
      v-model="plateNumber"
      label="Гос. номер"
      placeholder="А123БВ777"
      mono
      :maxlength="9"
      :transform="(raw) => raw.toUpperCase()"
    />

    <BaseInput
      v-model="year"
      label="Год выпуска"
      type="number"
      inputmode="numeric"
      placeholder="2020"
      :error="yearError && 'Некорректный год выпуска'"
    />

    <BaseInput
      v-model="enginePower"
      label="Мощность двигателя, л.с."
      type="number"
      inputmode="numeric"
      placeholder="150"
    />

    <BaseSelect
      class="car-data__span"
      label="Категория ТС"
      placeholder="Выберите категорию"
      :options="categoryOptions"
      :model-value="category"
      @update:model-value="(value) => (category = value as CarCategory)"
    />
  </div>
</template>

<script setup lang='ts'>
import { ref, computed, watch } from "vue"
import BaseInput from "@/components/ui/BaseInput.vue"
import BaseSelect from "@/components/ui/BaseSelect.vue"
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

function normalizeVin(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
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
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.car-data {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6) var(--space-6);
  width: 100%;

  &__span {
    grid-column: 1 / -1;
    max-width: calc(50% - var(--space-3));
  }

  @include mobile {
    grid-template-columns: 1fr;
    gap: var(--space-6);

    &__span {
      max-width: 100%;
    }
  }
}
</style>
