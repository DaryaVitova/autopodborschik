import { computed, type Ref } from 'vue'
import { MONTHS_IN_YEAR, PERCENT_CONVERSION, INCOME_COEFFICIENT } from '@/helpers/consts.ts'

interface PaymentSchedule {
  month: number
  payment: number
  principal: number
  interest: number
  remaining: number
}

export function useCreditCalculation(
  loanAmount: Ref<number>,
  interestRate: Ref<number>,
  loanTermYears: Ref<number>
) {

  // Ежемесячный платеж (аннуитетный)
  const monthlyPayment = computed((): number => {
    if (!loanAmount.value || !interestRate.value || !loanTermYears.value) {
      return 0
    }

    const monthlyRate = interestRate.value / PERCENT_CONVERSION / MONTHS_IN_YEAR
    const months = loanTermYears.value * MONTHS_IN_YEAR

    if (monthlyRate === 0) {
      return Math.round(loanAmount.value / months)
    }

    const denominator = Math.pow(1 + monthlyRate, months) - 1
    if (denominator === 0) {
      return Math.round(loanAmount.value / months)
    }

    const payment = loanAmount.value *
      (monthlyRate * Math.pow(1 + monthlyRate, months)) /
      denominator

    return Math.round(payment)
  })

  // Необходимый доход
  const requiredIncome = computed((): number=> {
    return Math.round(monthlyPayment.value * INCOME_COEFFICIENT)
  })

  // Общая сумма выплат
  const totalPayment = computed((): number => {
    return monthlyPayment.value * loanTermYears.value * MONTHS_IN_YEAR
  })

  // Переплата
  const overpayment = computed((): number => {
    return totalPayment.value - loanAmount.value
  })

  // Процент переплаты
  const overpaymentPercentage = computed((): number => {
    if (!loanAmount.value) return 0
    return (overpayment.value / loanAmount.value) * PERCENT_CONVERSION
  })

  // График платежей
  const paymentSchedule = computed((): PaymentSchedule[] => {
    const schedule = []
    const monthlyRate = interestRate.value / PERCENT_CONVERSION / MONTHS_IN_YEAR
    const months = loanTermYears.value * MONTHS_IN_YEAR
    let remaining = loanAmount.value
    const fixedMonthlyPayment = monthlyPayment.value

    for (let month = 1; month <= months; month++) {
      const interest = remaining * monthlyRate
      let principal = fixedMonthlyPayment - interest

      if (principal > remaining) {
        principal = remaining
      }

      remaining = Math.max(0, remaining - principal)

      // Фактический платеж может отличаться в последнем месяце
      const actualPayment = principal + interest


      schedule.push({
        month,
        payment: Math.round(actualPayment),
        principal: Math.round(principal),
        interest: Math.round(interest),
        remaining: Math.round(remaining)
      })

      if (remaining === 0) break
    }

    return schedule
  })

  return {
    monthlyPayment,
    totalPayment,
    overpayment,
    overpaymentPercentage,
    paymentSchedule,
    requiredIncome
  }
}
