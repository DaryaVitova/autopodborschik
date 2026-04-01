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
          class="calculate-credit__price-slider calculate-credit__price-slider--first"
          label="Стоимость авто"
          :maxValue="10000000"
          :minValue="50000"
          :priceAuto="priceAuto"
        >
          <span class="calculate-credit__note">* значения в слайдерах можно менять вручную</span>
        </price-slider>

        <div class="calculate-credit__price-slider--down-payment">
          <span class="calculate-credit__price-slider--percent">{{ calcDownPaymentPercent }} %</span>
          <price-slider
            v-model="downPayment"
            class="calculate-credit__price-slider"
            :label="isMobile ? 'Первоначальный взнос' : 'Первоначальный взнос (минимум 10% от стоимости)'"
            :maxValue="maxDownPayment"
            :priceAuto="priceAuto"
            downPayment
          />
          <div class="calculate-credit__checkbox">
            <input
              v-model="notResetValue"
              type="checkbox"
              id="checkbox"
              class="checkbox--mark calculate-credit__checkbox--mark"
            />
            <label
              for="checkbox"
              class="calculate-credit__checkbox--label"
            >
              Не сбрасывать к минимуму при изменении стоимости
            </label>
          </div>
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
          <label
            for="checkbox"
            class="calculate-credit__checkbox--label"
          >
            Срок в месяцах
          </label>
        </div>
      </div>
    </div>

    <div class="calculate-credit__right-side">
      <div class="calculate-credit__calculate-container">
        <div class="calculate-credit__calculate">
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

        <div class="calculate-credit__calculate">
          <calculate-credit
            label="Сумма кредита"
            :value="formatNumber(loanAmountCalculate)"
          />

          <calculate-credit
            label="Необходимый доход"
            :value="formatNumber(requiredIncome)"
          />
        </div>

        <div class="calculate-credit__calculate">
          <calculate-credit
            label="Общая сумма"
            :value="formatNumber(Math.round(totalPayment))"
          />

          <calculate-credit
            label="Переплата"
            :value="formatNumber(Math.round(overpayment))"
          />
        </div>
      </div>

      <button class="calculate-credit__schedule-btn" @click="openLightbox">
        <ScheduleIcon />
        График платежей
      </button>
    </div>

    <div v-if="lightboxActive" class="lightbox" @click="closeLightbox">
      <div class="lightbox__content">
        <payment-schedule
          :percent="activePercent"
          :sumCredit="loanAmountCalculate"
          :termCredit="loanTerm"
          :calcInMonths="toggleCalcInMonths"
          :overpayment="overpayment"
          :monthlyPayment="monthlyPayment"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PriceSlider from "@/components/AutoCredit/PriceSlider.vue"
import {computed, onMounted, onUnmounted, ref, watch} from "vue"
import { useFormatters } from "@/composables/formatters.ts"
import { useCreditCalculation } from "@/composables/creditCalculation.ts"
import CalculateCredit from "@/components/AutoCredit/CalculateCredit.vue"
import ScheduleIcon from "@/components/SvgIcons/ScheduleIcon.vue"
import PaymentSchedule from "@/components/AutoCredit/PaymentSchedule.vue"

const props = defineProps<{
  exposePrice?: string
}>()

interface CreditCalculatorData {
  priceAuto: number,
  downPayment: number,
  loanTerm: number,
  toggleCalcInMonths: boolean,
  notResetValue: boolean,
  activeRate: 'base' | 'family' | 'military'
}

const { formatNumber } = useFormatters()

const loadFromStorage = (): CreditCalculatorData | null => {
  try {
    const saved = sessionStorage.getItem('auto_credit')
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
    notResetValue: notResetValue.value,
    activeRate: activeRate.value,
  }

  sessionStorage.setItem('auto_credit', JSON.stringify(data))
}


const savedData = loadFromStorage()

onMounted(() => {
  activePercent.value = basePercent

  if (props.exposePrice) {
    priceAuto.value = Number(props.exposePrice)
    downPayment.value = Math.round(priceAuto.value * 0.1)
  }

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

  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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
const notResetValue = ref<boolean>(savedData?.notResetValue ?? false)

const lightboxActive = ref<boolean>(false)

const activeRate = ref<'base' | 'family' | 'military'>(savedData?.activeRate ?? 'base')

const isMobile = ref(false)

const checkMobile = () => {
  window.innerWidth < 768 ? isMobile.value = true : isMobile.value = false
}

const calcTermCredit = computed((): number => {
  if (!toggleCalcInMonths.value) {
    return loanTerm.value
  } else {
    const num = loanTerm.value / 12
    return Math.round(num * 10) / 10
  }
})

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
  if (!notResetValue.value) {
    downPayment.value = minDownPayment.value
  }

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
  console.log(newValue, 'downPayment----')
  if (newValue > priceAuto.value) {
    downPayment.value = priceAuto.value
  }
  if (newValue < minDownPayment.value) {
    downPayment.value = minDownPayment.value
  }
  saveToStorage()
})

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

function openLightbox() {
  lightboxActive.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxActive.value = false
  document.body.style.overflow = 'auto'
}

const {
  monthlyPayment,
  requiredIncome,
  totalPayment,
  overpayment
} = useCreditCalculation(
  loanAmountCalculate,
  activePercent,
  calcTermCredit
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
    border-radius: var(--border-radius-md);
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

  &__note {
    font-size: 14px;
    color: #9e9e9e;
    display: block;
    margin-bottom: 10px;
  }

  &__right-side {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__calculate-container {
    display: flex;
    flex-direction: column;
    gap: 25px;
    margin-top: 35px;
    background-color: #ffffff;
    border-radius: var(--border-radius-md);
    padding: 20px;
    width: 450px;
  }

  &__calculate {
    display: flex;
    gap: 10px;
  }

  &__schedule-btn {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 10px;
    padding: 5px 6px 8px 6px;
    border: 2px solid #1f6a1f;
    border-radius: var(--border-radius-md);
    margin-top: 50px;
    background-color: #fff;
    &:hover {
      opacity: 0.7;
      transition-duration: 0.5s;
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

    &--label {
      font-size: 15px;
    }
  }
}

.lightbox {
  @include lightbox;
  background: rgba(126, 126, 126, 0.7);
  align-items: flex-end;
  &__content {
    width: 700px;
    //width: 70%;
    height: 90%;
    border-radius: 12px;
    background-color: white;
  }
}

@media (max-width: 1100px) {
  .calculate-credit {
    gap: 60px;
  }
}

@media (max-width: 1023px) {
  .calculate-credit {
    flex-direction: column;
    &__left-side, &__right-side {
      width: 100%;
    }

    &__right-side {
      margin-bottom: 120px;
    }

    &__calculate-container {
      width: 80%;
    }
  }
}

@media (max-width: 767px) {
  .calculate-credit {
    &__price-slider {
      &--percent {
        font-size: 14px;
      }
    }

    &__calculate-container {
      width: 100%;
    }

    &__percent-btn {
      font-size: 14px;
      &--color-text {
        white-space: nowrap;
      }
    }

    &__note {
      font-size: 12px;
    }

    &__checkbox {
      &--label {
        font-size: 10px;
      }

      &--mark {
        width: 12px;
        height: 12px;
      }
    }
  }

  .lightbox {
    &__content {
      width: 80%;
    }
  }
}
</style>
