import { computed, type Ref } from 'vue'

// export interface CreditCalculation {
//   monthlyPayment: number
//   totalPayment: number
//   overpayment: number
//   overpaymentPercentage: number
//   paymentSchedule: Array<{
//     month: number
//     payment: number
//     principal: number
//     interest: number
//     remaining: number
//   }>
// }

export function useCreditCalculation(
  loanAmount: Ref<number>,
  interestRate: Ref<number>,
  loanTermYears: Ref<number>
) {

  // Ежемесячный платеж (аннуитетный)
  const monthlyPayment = computed(() => {
    if (!loanAmount.value || !interestRate.value || !loanTermYears.value) {
      return 0
    }

    const monthlyRate = interestRate.value / 100 / 12
    const months = loanTermYears.value * 12

    // Формула аннуитетного платежа
    const payment = loanAmount.value *
      (monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)

    return Math.round(payment)
  })

  // Необходимый доход
  const requiredIncome = computed(() => {
    return Math.round(monthlyPayment.value * 1.8)
  })

  // Общая сумма выплат
  const totalPayment = computed(() => {
    return (monthlyPayment.value * loanTermYears.value * 12) + loanAmount.value
  })

  // Переплата
  const overpayment = computed(() => {
    return totalPayment.value - loanAmount.value
  })

  // Процент переплаты
  const overpaymentPercentage = computed(() => {
    if (!loanAmount.value) return 0
    return (overpayment.value / loanAmount.value) * 100
  })

  // График платежей
  const paymentSchedule = computed(() => {
    const schedule = []
    const monthlyRate = interestRate.value / 100 / 12
    const months = loanTermYears.value * 12
    let remaining = loanAmount.value

    for (let month = 1; month <= months; month++) {
      const interest = remaining * monthlyRate
      const principal = monthlyPayment.value - interest
      remaining -= principal

      schedule.push({
        month,
        payment: Math.round(monthlyPayment.value),
        principal: Math.round(principal),
        interest: Math.round(interest),
        remaining: Math.max(0, Math.round(remaining))
      })
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
