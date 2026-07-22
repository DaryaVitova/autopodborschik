<template>
  <div class="drivers">
    <SegmentedControl
      class="drivers__mode"
      aria-label="Режим допуска водителей"
      :options="modeOptions"
      :model-value="mode"
      @update:model-value="(value) => (mode = value as DriversMode)"
    />

    <p v-if="mode === 'unlimited'" class="drivers__note">
      Управлять автомобилем сможет любой водитель — данные водителей вписывать не нужно.
    </p>

    <div v-else class="drivers__list">
      <BaseCard v-for="(driver, index) in drivers" :key="index" class="drivers__card">
        <div class="drivers__card-header">
          <span class="drivers__card-title">Водитель {{ index + 1 }}</span>
          <BaseButton
            v-if="drivers.length > 1"
            variant="danger"
            size="sm"
            @click="removeDriver(index)"
          >
            <template #leading><Trash2 :size="16" /></template>
            Удалить
          </BaseButton>
        </div>

        <div class="drivers__fields">
          <BaseInput
            v-model="driver.age"
            label="Возраст"
            type="number"
            inputmode="numeric"
            placeholder="35"
          />
          <BaseInput
            v-model="driver.experience"
            label="Стаж вождения, лет"
            type="number"
            inputmode="numeric"
            placeholder="10"
            :error="experienceError(driver) && `Стаж не может превышать ${maxExperience(driver)} ${yearsLabel(maxExperience(driver))}`"
          />
          <BaseInput
            v-model="driver.accidentFreeYears"
            label="Лет без ДТП по своей вине"
            type="number"
            inputmode="numeric"
            placeholder="3"
            :error="accidentFreeYearsError(driver) && `Не может превышать ${maxAccidentFreeYears(driver)} ${yearsLabel(maxAccidentFreeYears(driver))}`"
          />
        </div>
      </BaseCard>

      <BaseButton variant="secondary" class="drivers__add" @click="addDriver">
        <template #leading><Plus :size="18" /></template>
        Добавить водителя
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed, watch } from "vue"
import { Plus, Trash2 } from "@lucide/vue"
import SegmentedControl from "@/components/ui/SegmentedControl.vue"
import BaseInput from "@/components/ui/BaseInput.vue"
import BaseButton from "@/components/ui/BaseButton.vue"
import BaseCard from "@/components/ui/BaseCard.vue"
import type { InsuranceDriver, DriversMode } from "@/composables/insuranceCalculation.ts"

type Driver = InsuranceDriver

const emit = defineEmits<{
  (e: 'DriversValid', value: boolean): void
  (e: 'DriversUpdate', value: { mode: DriversMode, drivers: Driver[] }): void
}>()

const modeOptions = [
  { value: 'unlimited', label: 'Без ограничений' },
  { value: 'list', label: 'По списку' }
]

function createDriver(): Driver {
  return { age: null, experience: null, accidentFreeYears: null }
}

const mode = ref<DriversMode>('list')
const drivers = ref<Driver[]>([createDriver()])

function addDriver() {
  drivers.value.push(createDriver())
}

function removeDriver(index: number) {
  drivers.value.splice(index, 1)
}

function ageError(driver: Driver): boolean {
  return driver.age !== null && (driver.age < 18 || driver.age > 100)
}

const MIN_DRIVING_AGE = 18

function maxExperience(driver: Driver): number {
  if (driver.age === null) return 0
  return Math.max(0, driver.age - MIN_DRIVING_AGE)
}

function experienceError(driver: Driver): boolean {
  if (driver.experience === null || driver.age === null) return false
  return driver.experience < 0 || driver.experience > maxExperience(driver)
}

function yearsLabel(value: number): string {
  const mod10 = value % 10
  const mod100 = value % 100

  if (mod10 === 1 && mod100 !== 11) return 'год'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'года'
  return 'лет'
}

function maxAccidentFreeYears(driver: Driver): number {
  if (driver.age === null) return 0
  if (driver.experience === null) return maxExperience(driver)
  return Math.min(driver.experience, maxExperience(driver))
}

function accidentFreeYearsError(driver: Driver): boolean {
  if (driver.accidentFreeYears === null || driver.age === null) return false
  return driver.accidentFreeYears < 0 || driver.accidentFreeYears > maxAccidentFreeYears(driver)
}

function isDriverValid(driver: Driver): boolean {
  return (
    driver.age !== null && !ageError(driver) &&
    driver.experience !== null && !experienceError(driver) &&
    driver.accidentFreeYears !== null && !accidentFreeYearsError(driver)
  )
}

const isValid = computed(() => {
  if (mode.value === 'unlimited') return true
  return drivers.value.every(isDriverValid)
})

watch(isValid, (value) => {
  emit('DriversValid', value)
}, { immediate: true })

watch([mode, drivers], () => {
  emit('DriversUpdate', { mode: mode.value, drivers: drivers.value })
}, { deep: true, immediate: true })
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.drivers {
  width: 100%;

  &__mode {
    max-width: 360px;
  }

  &__note {
    margin: var(--space-6) 0 0;
    padding: var(--space-4) var(--space-5);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--ink-muted);
  }

  &__list {
    margin-top: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  &__card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-5);
  }
  &__card-title {
    font-weight: 700;
    font-size: var(--text-lg);
    color: var(--ink);
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-5) var(--space-4);
  }

  &__add {
    align-self: flex-start;
  }

  @include mobile {
    &__mode {
      max-width: 100%;
    }
    &__fields {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }
  }
}
</style>
