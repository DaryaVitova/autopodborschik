<template>
  <div class="calculation">
    <div class="calculation__field">
      <label class="calculation__label">Регион регистрации ТС</label>
      <div
        class="calculation__select"
        :class="{ 'calculation__select--open': isRegionOpen }"
        tabindex="0"
        @click="isRegionOpen = !isRegionOpen"
        @blur="isRegionOpen = false"
      >
        <span>{{ selectedRegionLabel }}</span>
        <arrow-icon
          class="calculation__select-arrow"
          :class="{ 'calculation__select-arrow--open': isRegionOpen }"
        />

        <div v-if="isRegionOpen" class="calculation__select-dropdown">
          <div
            v-for="option in regions"
            :key="option.value"
            class="calculation__select-option"
            @mousedown.prevent="selectRegion(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="isReadyToCalculate" class="calculation__result">
      <div class="calculation__breakdown">
        <div class="calculation__row">
          <span>Базовый тариф</span>
          <span>{{ formatNumber(baseRate) }} ₽</span>
        </div>
        <div class="calculation__row">
          <span>Территориальный коэффициент (КТ)</span>
          <span>{{ territoryCoefficient }}</span>
        </div>
        <div class="calculation__row">
          <span>Коэффициент возраста и стажа (КВС)</span>
          <span>{{ ageExperienceCoefficient }}</span>
        </div>
        <div class="calculation__row">
          <span>Коэффициент бонус-малус (КБМ)</span>
          <span>{{ bonusMalusCoefficient }}</span>
        </div>
        <div class="calculation__row">
          <span>Без ограничения водителей (КО)</span>
          <span>{{ unlimitedDriversCoefficient }}</span>
        </div>
        <div class="calculation__row">
          <span>Коэффициент мощности двигателя (КМ)</span>
          <span>{{ powerCoefficient }}</span>
        </div>
      </div>

      <div class="calculation__total">
        <span class="calculation__total-label">Стоимость полиса ОСАГО</span>
        <span class="calculation__total-value">{{ formatNumber(totalPrice) }} ₽</span>
      </div>

      <p class="calculation__note">
        Расчёт приблизительный и не является публичной офертой. Итоговая стоимость полиса рассчитывается страховой компанией.
      </p>
    </div>

    <p v-else class="calculation__note">
      Заполните данные ТС и водителей на предыдущих шагах, чтобы увидеть расчёт стоимости.
    </p>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from "vue"
import ArrowIcon from "@/components/SvgIcons/ArrowIcon.vue"
import { useFormatters } from "@/composables/formatters.ts"
import {
  useInsuranceCalculation,
  REGIONS,
  type CarCategory,
  type DriversMode,
  type InsuranceDriver
} from "@/composables/insuranceCalculation.ts"

const props = defineProps<{
  category: CarCategory | ''
  enginePower: number | null
  mode: DriversMode
  drivers: InsuranceDriver[]
}>()

const { formatNumber } = useFormatters()

const regions = REGIONS
const regionValue = ref(regions[0]?.value ?? 'other')
const isRegionOpen = ref(false)

const selectedRegionLabel = computed(() => {
  return regions.find(region => region.value === regionValue.value)?.label ?? ''
})

function selectRegion(value: string) {
  regionValue.value = value
  isRegionOpen.value = false
}

const category = computed(() => props.category)
const enginePower = computed(() => props.enginePower)
const mode = computed(() => props.mode)
const drivers = computed(() => props.drivers)

const {
  baseRate,
  territoryCoefficient,
  ageExperienceCoefficient,
  bonusMalusCoefficient,
  unlimitedDriversCoefficient,
  powerCoefficient,
  isReadyToCalculate,
  totalPrice
} = useInsuranceCalculation(category, enginePower, regionValue, mode, drivers)
</script>

<style lang="scss" scoped>
.calculation {
  width: 80%;
  margin-top: 60px;
  margin-bottom: 80px;

  &__field {
    display: flex;
    flex-direction: column;
    width: 320px;
  }

  &__label {
    margin-bottom: 8px;
    color: #504f4f;
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

  &__result {
    margin-top: 40px;
  }

  &__breakdown {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    color: #504f4f;

    span:last-child {
      color: var(--color-dark-blue);
      font-weight: 600;
    }
  }

  &__total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;

    &-label {
      font-size: 14px;
      color: #504f4f;
    }

    &-value {
      font-size: 20px;
      font-weight: 600;
      color: var(--color-middle-blue);
      border: 1px solid var(--color-middle-blue);
      border-radius: var(--border-radius-md);
      padding: 4px 12px;
    }
  }

  &__note {
    margin-top: 20px;
    font-size: 13px;
    color: #999999;
  }
}
</style>
