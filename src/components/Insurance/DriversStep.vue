<template>
  <div class="drivers">
    <div class="drivers__tabs">
      <div
        class="drivers__tab"
        :class="{ 'drivers__tab--active': mode === 'unlimited' }"
        @click="mode = 'unlimited'"
      >
        Без ограничений
      </div>
      <div
        class="drivers__tab"
        :class="{ 'drivers__tab--active': mode === 'list' }"
        @click="mode = 'list'"
      >
        По списку
      </div>
    </div>

    <p v-if="mode === 'unlimited'" class="drivers__unlimited-note">
      Управлять автомобилем сможет любой водитель, данные водителей вписывать не нужно.
    </p>

    <div v-else class="drivers__list">
      <div v-for="(driver, index) in drivers" :key="index" class="drivers__card">
        <div class="drivers__card-header">
          <span class="drivers__card-title">Водитель {{ index + 1 }}</span>
          <button
            v-if="drivers.length > 1"
            type="button"
            class="drivers__card-remove"
            @click="removeDriver(index)"
          >
            Удалить
          </button>
        </div>

        <div class="drivers__card-fields">
          <div class="drivers__field">
            <label class="drivers__label">Возраст</label>
            <input
              :value="driver.age ?? ''"
              @input="handleNumberInput($event, driver, 'age')"
              type="number"
              class="drivers__input"
              placeholder="35"
            />
          </div>

          <div class="drivers__field">
            <label class="drivers__label">Стаж вождения, лет</label>
            <input
              :value="driver.experience ?? ''"
              @input="handleNumberInput($event, driver, 'experience')"
              type="number"
              class="drivers__input"
              placeholder="10"
            />
            <span v-if="experienceError(driver)" class="drivers__error">
              Стаж не может превышать {{ maxExperience(driver) }} {{ yearsLabel(maxExperience(driver)) }}
            </span>
          </div>

          <div class="drivers__field">
            <label class="drivers__label">Лет без ДТП по своей вине</label>
            <input
              :value="driver.accidentFreeYears ?? ''"
              @input="handleNumberInput($event, driver, 'accidentFreeYears')"
              type="number"
              class="drivers__input"
              placeholder="3"
            />
            <span v-if="accidentFreeYearsError(driver)" class="drivers__error">
              Не может превышать {{ maxAccidentFreeYears(driver) }} {{ yearsLabel(maxAccidentFreeYears(driver)) }}
            </span>
          </div>
        </div>
      </div>

      <button type="button" class="drivers__add-btn" @click="addDriver">
        + Добавить водителя
      </button>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed, watch } from "vue"
import type { InsuranceDriver, DriversMode } from "@/composables/insuranceCalculation.ts"

type Driver = InsuranceDriver

const emit = defineEmits<{
  (e: 'DriversValid', value: boolean): void
  (e: 'DriversUpdate', value: { mode: DriversMode, drivers: Driver[] }): void
}>()

function createDriver(): Driver {
  return { age: null, experience: null, accidentFreeYears: null }
}

const mode = ref<'unlimited' | 'list'>('list')
const drivers = ref<Driver[]>([createDriver()])

function addDriver() {
  drivers.value.push(createDriver())
}

function handleNumberInput(event: Event, driver: Driver, field: 'age' | 'experience' | 'accidentFreeYears') {
  const target = event.target as HTMLInputElement
  driver[field] = target.value === '' ? null : Number(target.value)
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
.drivers {
  width: 80%;
  margin-top: 60px;
  margin-bottom: 80px;

  &__tabs {
    display: inline-flex;
    border: 1px solid #286b8c;
    height: 44px;
    border-radius: 80px;
    width: fit-content;
  }

  &__tab {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 16px;
    font-size: 14px;

    &:hover {
      cursor: pointer;
    }

    &--active {
      background-color: var(--color-middle-blue);
      border-radius: 80px;
      color: #fff;
    }
  }

  &__unlimited-note {
    margin-top: 30px;
    color: #999999;
  }

  &__list {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__card {
    border: 1px solid #e5e7eb;
    border-radius: var(--border-radius-md);
    padding: 20px;
  }

  &__card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  &__card-title {
    font-weight: 600;
    color: var(--color-dark-blue);
  }

  &__card-remove {
    border: none;
    background: transparent;
    color: #ec1518;

    &:hover {
      cursor: pointer;
      opacity: 0.7;
    }
  }

  &__card-fields {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

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

  &__error {
    position: absolute;
    bottom: -20px;
    left: 0;
    font-size: 13px;
    color: #ec1518;
  }

  &__add-btn {
    align-self: flex-start;
    border: 2px solid var(--color-middle-blue);
    background-color: transparent;
    color: var(--color-middle-blue);
    padding: 7px 20px;
    border-radius: 20px;

    &:hover {
      cursor: pointer;
      background-color: var(--color-middle-blue);
      color: #fff;
      transition-duration: 0.4s;
    }
  }
}
</style>
