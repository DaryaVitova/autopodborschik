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
        />

        <div class="calculate-credit__price-slider--down-payment">
          <span class="calculate-credit__price-slider--percent">{{ calcDownPaymentPercent }} %</span>
          <price-slider
            v-model="downPayment"
            class="calculate-credit__price-slider"
            label="Первоначальный взнос (минимум 10% от стоимости)"
            :maxValue="maxDownPayment"
          />
        </div>

        <price-slider
          v-model="loanTerm"
          class="calculate-credit__price-slider"
          label="Срок кредита"
          :minValue="1"
          :maxValue="15"
          :stepValue="1"
        />
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

const { formatNumber } = useFormatters()

onMounted(() => {
  activePercent.value = basePercent
})

const basePercent: number = 17
const familyPercent: number = 8.5
const militaryPercent: number = 14.2

const activePercent = ref<number>(basePercent)

const priceAuto = ref<number>(800000)
const downPayment = ref<number>(Math.round(priceAuto.value * 0.1))
const loanTerm = ref<number>(2)

const activeRate = ref<'base' | 'family' | 'military'>('base')

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

const loanAmountCalculate = computed((): number => {
  return priceAuto.value - downPayment.value
})

const minDownPayment = computed((): number => {
  return priceAuto.value * 0.1
})

const maxDownPayment = computed((): number => {
  return (priceAuto.value - 50000)
})

const calcDownPaymentPercent = computed((): number => {
  const percent = (downPayment.value / priceAuto.value) * 100
  return parseFloat(percent.toFixed(1))
})

watch(() => priceAuto.value, () => {
  downPayment.value = minDownPayment.value
})

watch(() => downPayment.value, (newValue) => {
  if (newValue > priceAuto.value) {
    downPayment.value = priceAuto.value
  }
  if (newValue < minDownPayment.value) {
    downPayment.value = minDownPayment.value
  }
})

const {
  monthlyPayment,
  requiredIncome,
  totalPayment,
  overpayment
} = useCreditCalculation(
  loanAmountCalculate,
  activePercent,
  loanTerm
)
</script>

<style lang="scss" scoped>
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
}
</style>
