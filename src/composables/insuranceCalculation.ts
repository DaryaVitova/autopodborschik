import { computed, type Ref } from 'vue'

export interface InsuranceDriver {
  age: number | null
  experience: number | null
  accidentFreeYears: number | null
}

export type CarCategory = 'A' | 'B' | 'C' | 'D'
export type DriversMode = 'unlimited' | 'list'

export interface Region {
  value: string
  label: string
  kt: number
}

export const REGIONS: Region[] = [
  { value: 'moscow', label: 'Москва', kt: 1.982 },
  { value: 'spb', label: 'Санкт-Петербург', kt: 1.8 },
  { value: 'ekb', label: 'Екатеринбург', kt: 1.7 },
  { value: 'nsk', label: 'Новосибирск', kt: 1.6 },
  { value: 'other', label: 'Другой регион', kt: 1.0 }
]

const BASE_RATES: Record<CarCategory, number> = {
  A: 1570,
  B: 4118,
  C: 4941,
  D: 3573
}

const UNLIMITED_DRIVERS_COEFFICIENT = 1.87

// Коэффициент бонус-малус, классы от M до 13 (индекс 0..14)
const KBM_TABLE = [2.45, 2.3, 1.55, 1.4, 1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5]
const KBM_STARTING_INDEX = 4 // класс 3 — стартовый для новых водителей

function getKbmCoefficient(accidentFreeYears: number): number {
  const index = Math.min(KBM_TABLE.length - 1, KBM_STARTING_INDEX + Math.max(0, accidentFreeYears))
  return KBM_TABLE[index] ?? 1
}

// Коэффициент возраста и стажа водителя
function getKvsCoefficient(age: number, experience: number): number {
  if (age <= 21 && experience <= 2) return 1.87
  if (age <= 24 || experience <= 2) return 1.77
  if (age <= 29 || experience <= 4) return 1.24
  if (age <= 39 || experience <= 6) return 1.11
  if (age <= 59 || experience <= 9) return 0.98
  return 0.93
}

// Коэффициент мощности двигателя
function getKmCoefficient(enginePower: number): number {
  if (enginePower <= 50) return 0.6
  if (enginePower <= 70) return 1.0
  if (enginePower <= 100) return 1.1
  if (enginePower <= 120) return 1.2
  if (enginePower <= 150) return 1.4
  return 1.6
}

export function useInsuranceCalculation(
  category: Ref<CarCategory | ''>,
  enginePower: Ref<number | null>,
  regionValue: Ref<string>,
  mode: Ref<DriversMode>,
  drivers: Ref<InsuranceDriver[]>
) {
  const baseRate = computed(() => {
    return category.value ? BASE_RATES[category.value] : 0
  })

  const territoryCoefficient = computed(() => {
    return REGIONS.find(region => region.value === regionValue.value)?.kt ?? 1
  })

  const powerCoefficient = computed(() => {
    return enginePower.value !== null ? getKmCoefficient(enginePower.value) : 0
  })

  const unlimitedDriversCoefficient = computed(() => {
    return mode.value === 'unlimited' ? UNLIMITED_DRIVERS_COEFFICIENT : 1
  })

  const validDrivers = computed(() => {
    return drivers.value.filter(
      (driver): driver is { age: number, experience: number, accidentFreeYears: number } =>
        driver.age !== null && driver.experience !== null && driver.accidentFreeYears !== null
    )
  })

  const ageExperienceCoefficient = computed(() => {
    if (mode.value === 'unlimited' || validDrivers.value.length === 0) return 1
    return Math.max(...validDrivers.value.map(driver => getKvsCoefficient(driver.age, driver.experience)))
  })

  const bonusMalusCoefficient = computed(() => {
    if (mode.value === 'unlimited' || validDrivers.value.length === 0) return 1
    return Math.max(...validDrivers.value.map(driver => getKbmCoefficient(driver.accidentFreeYears)))
  })

  const isReadyToCalculate = computed(() => {
    if (!category.value || enginePower.value === null) return false
    if (mode.value === 'list' && validDrivers.value.length === 0) return false
    return true
  })

  const totalPrice = computed(() => {
    if (!isReadyToCalculate.value) return 0

    const price = baseRate.value *
      territoryCoefficient.value *
      ageExperienceCoefficient.value *
      bonusMalusCoefficient.value *
      unlimitedDriversCoefficient.value *
      powerCoefficient.value

    return Math.round(price)
  })

  return {
    baseRate,
    territoryCoefficient,
    ageExperienceCoefficient,
    bonusMalusCoefficient,
    unlimitedDriversCoefficient,
    powerCoefficient,
    isReadyToCalculate,
    totalPrice
  }
}
