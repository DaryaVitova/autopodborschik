<template>
  <div class="payment-schedule" ref="paymentScheduleRef">
    <div class="payment-schedule__header">
      <h2 class="payment-schedule__header-title">График платежей</h2>
      <div class="payment-schedule__header-container">
        <div class="payment-schedule__header-first-section">
          <div class="payment-schedule__header-value-container">
          <span class="payment-schedule__header-label">
            Сумма кредита
          </span>
            <span class="payment-schedule__header-value">{{ formatNumber(sumCredit) }} ₽</span>
          </div>

          <div class="payment-schedule__header-value-container">
          <span class="payment-schedule__header-label">
            Ставка
          </span>
            <span class="payment-schedule__header-value">{{ percent }} %</span>
          </div>

          <div class="payment-schedule__header-value-container">
          <span class="payment-schedule__header-label">
            Срок кредита
          </span>
            <span class="payment-schedule__header-value">{{ calcTermCredit }}</span>
          </div>
        </div>

        <div class="payment-schedule__header-second-section">
          <pie-chart :sumCredit="sumCredit" :overpayment="overpayment" />
        </div>
      </div>
    </div>

    <div class="payment-schedule__main">
      <div
        class="payment-schedule__sticky-container"
        :ref="(el) => stickyButtonsRef = el as HTMLElement | null"
      >
        <div class="payment-schedule__main-buttons">
          <years-buttons
            :yearsOld="yearsCount"
            :updateSelectYear="scrollActiveYear"
            @select-year="handleYearSelect"
            @manual-select="handleManualSelect"
          />
        </div>
      </div>

      <div class="payment-schedule__main-table">
        <payment-table
          :yearsOld="calcTermCredit"
          :sumCredit="sumCredit"
          :overpayment="overpayment"
          :monthlyPayment="monthlyPayment"
          :selectedYear="selectedYear"
          :containerRef="paymentScheduleRef"
          :buttonsRef="stickyButtonsRef"
          :manualActive="manualSelectionActive"
          @update:years-count="handleYearsCount"
          @scroll-active-year="(value) => scrollActiveYear = value"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PieChart from "@/components/AutoCredit/PieChart.vue"
import { useFormatters } from "@/composables/useFormatters.ts"
import YearsButtons from "@/components/AutoCredit/YearsButtons.vue"
import {computed, ref} from "vue"
import PaymentTable, { type PaymentTableExpose } from "@/components/AutoCredit/PaymentTable.vue"

const props = defineProps<{
  percent: number,
  sumCredit: number,
  termCredit: number,
  overpayment: number,
  calcInMonths: boolean,
  monthlyPayment: number
}>()

const { formatNumber } = useFormatters()

const yearsCount = ref<number>(0)

const selectedYear = ref<number | null>(null)
const paymentTableRef = ref<PaymentTableExpose | null>(null)
const paymentScheduleRef = ref<HTMLElement | null>(null)
const stickyButtonsRef = ref<HTMLElement | null>(null)
const scrollActiveYear = ref<number | null>(null)

const manualSelectionActive = ref(false)
let selectionTimeout: ReturnType<typeof setTimeout>

function handleYearSelect(year: number | null) {
  selectedYear.value = year

  // Если выбран конкретный год, прокручиваем к нему
  if (year !== null && paymentTableRef.value) {
    // Даем время на перерисовку таблицы
    setTimeout(() => {
      paymentTableRef.value?.scrollToYear(year)
    }, 100)
  }
}

const calcTermCredit = computed((): number => {
  if (!props.calcInMonths) {
    return props.termCredit
  } else {
    const num = props.termCredit / 12
    return Math.round(num * 10) / 10
  }
})

function handleYearsCount(count: number): void {
  console.log(count, 'count')
  yearsCount.value = count
}

const handleManualSelect = () => {
  manualSelectionActive.value = true

  if (selectionTimeout) clearTimeout(selectionTimeout)

  selectionTimeout = setTimeout(() => {
    manualSelectionActive.value = false
  }, 1500)
}
</script>

<style lang="scss" scoped>
.payment-schedule {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  &__header {
    padding: 30px;
    display: flex;
    flex-direction: column;

    &-title {
      margin-bottom: 25px;
      color: #373737;
    }

    &-label {
      font-size: 14px;
      color: #5a5b5c;
    }

    &-value {
      font-size: 20px;
      font-weight: 500;
    }

    &-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }

    &-first-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    &-value-container {
      display: flex;
      flex-direction: column;
    }
  }

  &__sticky-container {
    position: sticky;
    top: 0;
    z-index: 150;
    background: white;
    padding: 10px 0;
  }
}
</style>
