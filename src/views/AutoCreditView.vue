<template>
  <div class="calculate-credit">
    <div class="calculate-credit__left-side">
      <div class="calculate-credit__buttons-container">
        <span>Процентная ставка</span>

        <div class="calculate-credit__percent-buttons">
          <button
            class="calculate-credit__percent-btn"
            :class="{ 'calculate-credit__percent-btn--active': activeRate === 'base' }"
            @click="setActiveRate('base')"
          >
            Базовая <span class="calculate-credit__percent-btn--color-text">{{ basePercent }} %</span>
          </button>

          <button
            class="calculate-credit__percent-btn"
            :class="{ 'calculate-credit__percent-btn--active': activeRate === 'family' }"
            @click="setActiveRate('family')"
          >
            Семейная <span class="calculate-credit__percent-btn--color-text">{{ familyPercent }} %</span>
          </button>

          <button
            class="calculate-credit__percent-btn"
            :class="{ 'calculate-credit__percent-btn--active': activeRate === 'military' }"
            @click="setActiveRate('military')"
          >
            Военная <span class="calculate-credit__percent-btn--color-text">{{ militaryPercent }} %</span>
          </button>
        </div>
      </div>

      <div class="calculate-credit__price-sliders">
        <price-slider
          v-model="priceAuto"
          class="calculate-credit__price-slider"
          label="Стоимость авто"
          :maxValue="10000000"
          :minValue="50000"
          :priceAuto="priceAuto"
        />

        <div class="calculate-credit__price-slider--down-payment">
          <span class="calculate-credit__price-slider--percent">{{ calcDownPaymentPercent }} %</span>
          <price-slider
            v-model="downPayment"
            class="calculate-credit__price-slider"
            label="Первоначальный взнос (минимум 10% от стоимости)"
            :maxValue="maxDownPayment"
            :priceAuto="priceAuto"
            downPayment
          />
        </div>

        <price-slider
          v-model="loanTerm"
          class="calculate-credit__price-slider"
          label="Срок кредита"
          :minValue="minOldValue"
          :maxValue="maxOldValue"
          :priceAuto="priceAuto"
          :stepValue="1"
        />
        <div class="calculate-credit__checkbox">
          <input
            v-model="toggleCalcInMonths"
            type="checkbox"
            id="checkbox"
            class="checkbox--mark calculate-credit__checkbox--mark"
          />
          <label for="checkbox">Срок в месяцах</label>
        </div>
      </div>
    </div>

    <div class="calculate-credit__right-side">
      <div class="calculate-credit__right-side-container">
        <calculate-credit
          label="Процентная ставка"
          :value="activePercent"
          percent
        />

        <calculate-credit
          label="Ежемесячный платёж"
          :value="formatNumber(monthlyPayment)"
        />
      </div>

      <div class="calculate-credit__right-side-container">
        <calculate-credit
          label="Сумма кредита"
          :value="formatNumber(loanAmountCalculate)"
        />

        <calculate-credit
          label="Необходимый доход"
          :value="formatNumber(requiredIncome)"
        />
      </div>

      <div class="calculate-credit__right-side-container">
        <calculate-credit
          label="Общая сумма"
          :value="formatNumber(totalPayment)"
        />

        <calculate-credit
          label="Переплата"
          :value="formatNumber(overpayment)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PriceSlider from "@/components/AutoCredit/PriceSlider.vue"
import {computed, onMounted, ref, watch} from "vue"
import { useFormatters } from "@/composables/useFormatters.ts"
import { useCreditCalculation } from "@/composables/useCreditCalculation"
import CalculateCredit from "@/components/AutoCredit/CalculateCredit.vue"

interface CreditCalculatorData {
  priceAuto: number,
  downPayment: number,
  loanTerm: number,
  toggleCalcInMonths: boolean,
  activeRate: 'base' | 'family' | 'military'
}

const { formatNumber } = useFormatters()

const loadFromStorage = (): CreditCalculatorData | null => {
  try {
    const saved = localStorage.getItem('auto_credit')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.log(error)
  }

  return null
}


const saveToStorage = (): void => {
  const data: CreditCalculatorData = {
    priceAuto: priceAuto.value,
    downPayment: downPayment.value,
    loanTerm: loanTerm.value,
    toggleCalcInMonths: toggleCalcInMonths.value,
    activeRate: activeRate.value,
  }

  localStorage.setItem('auto_credit', JSON.stringify(data))
}


const savedData = loadFromStorage()

onMounted(() => {
  activePercent.value = basePercent

  if (savedData?.activeRate) {
    switch(savedData.activeRate) {
      case 'base':
        activePercent.value = basePercent
        break
      case 'family':
        activePercent.value = familyPercent
        break
      case 'military':
        activePercent.value = militaryPercent
        break
    }
  }
})

const basePercent: number = 17
const familyPercent: number = 8.5
const militaryPercent: number = 14.2

const activePercent = ref<number>(basePercent)

const priceAuto = ref<number>(savedData?.priceAuto ?? 800000)
const downPayment = ref<number>(savedData?.downPayment ?? Math.round(priceAuto.value * 0.1))
const loanTerm = ref<number>(savedData?.loanTerm ?? 2)
const localLoanTerm = ref<number>(2)

const toggleCalcInMonths = ref<boolean>(savedData?.toggleCalcInMonths ?? false)

const activeRate = ref<'base' | 'family' | 'military'>(savedData?.activeRate ?? 'base')

const setActiveRate = (rate: 'base' | 'family' | 'military') => {
  activeRate.value = rate

  switch(rate) {
    case 'base':
      activePercent.value = basePercent
      break
    case 'family':
      activePercent.value = familyPercent
      break
    case 'military':
      activePercent.value = militaryPercent
      break
  }
}

watch(() => toggleCalcInMonths.value, (newVal) => {
  if (newVal) {
    loanTerm.value = loanTerm.value * 12
    localLoanTerm.value = Math.round(loanTerm.value / 12)
  } else {
    loanTerm.value = Math.round(loanTerm.value / 12)
    localLoanTerm.value = loanTerm.value
  }
})

watch(() => loanTerm.value, (newVal) => {
  console.log(newVal, 'loanTerm.value')
  if (!toggleCalcInMonths.value) {
    localLoanTerm.value = newVal
  } else {
    localLoanTerm.value = Math.round(newVal / 12)
  }

  saveToStorage()
}, { immediate: true })


watch(() => priceAuto.value, (newValue) => {
  if (newValue < 50000) {
    priceAuto.value = 50000
  }
  downPayment.value = minDownPayment.value

  saveToStorage()
})

watch(() => activeRate.value, () => {
  saveToStorage()
})

const minOldValue = computed(() => {
  return !toggleCalcInMonths.value ? 1 : 12
})

const maxOldValue = computed(() => {
  return !toggleCalcInMonths.value ? 15 : 180
})

const loanAmountCalculate = computed((): number => {
  return priceAuto.value - downPayment.value
})

const minDownPayment = computed((): number => {
  return priceAuto.value * 0.1
})

const maxDownPayment = computed((): number => {
  return priceAuto.value - 50000
})

const calcDownPaymentPercent = computed((): number => {
  const percent = (downPayment.value / priceAuto.value) * 100
  return parseFloat(percent.toFixed(1))
})

watch(() => downPayment.value, (newValue) => {
  if (newValue > priceAuto.value) {
    downPayment.value = priceAuto.value
  }
  if (newValue < minDownPayment.value) {
    downPayment.value = minDownPayment.value
  }
  saveToStorage()
})

const {
  monthlyPayment,
  requiredIncome,
  totalPayment,
  overpayment
} = useCreditCalculation(
  loanAmountCalculate,
  activePercent,
  localLoanTerm
)
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;
.calculate-credit {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 100px;
  margin-top: 120px;
  width: 90%;
  &__percent-buttons {
    display: flex;
    gap: 16px;
    margin-top: 10px;
  }

  &__percent-btn {
    border: 1px solid #afafaf;
    padding: 7px 12px;
    border-radius: 8px;
    &:hover {
      background-color: #e8e8e8;
      transition: transform 0.2s ease;
    }
    &--active {
      border: 2px solid #3f7e3f;
    }
    &--color-text {
      color: green !important;
      margin-left: 5px;
    }
  }

  &__price-slider {
    margin-top: 60px;

    &--down-payment {
      height: fit-content;
      position: relative;
    }

    &--percent {
      position: absolute;
      right: 15px;
      bottom: 50%;
      z-index: 300;
      font-size: 18px;
      color: #3f7e3f;
    }
  }

  &__right-side {
    display: flex;
    flex-direction: column;
    gap: 25px;
    margin-top: 35px;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    width: 450px;

    &-container {
      display: flex;
      gap: 10px;
    }
  }

  &__checkbox {
    margin-top: 15px;
    text-align: start;
    justify-content: flex-start !important;
    &--mark {
      accent-color: #118021;
      &:hover {
        transition-duration: 0.5s;
      }
    }
    @include checkbox;
  }
}
</style>
