<template>
  <table class="table">
    <thead class="table__head" :ref="(el) => tableHeadRef = el as HTMLElement | null">
      <tr class="table__head-row">
        <th class="table__head-title">Дата</th>
        <th class="table__head-title">Платеж</th>
        <th class="table__head-title">Остаток долга</th>
      </tr>
    </thead>

    <tbody class="table__body">
      <template v-for="(payment, index) in paymentSchedule" :key="index">
        <tr
          v-if="isShowYear(index, payment)"
          :id="'year-' + payment.year"
          :ref="(el) => setYearRowRef(el as HTMLElement | null, payment.year)"
          class="table__body-row table__body-row--year-separator"
        >
          <td colspan="3" class="table__body-cell table__body-cell--year">
            {{ payment.year }}
          </td>
        </tr>

        <!-- Строка платежа -->
        <tr class="table__body-row">
          <td class="table__body-cell">{{ payment.month }}</td>
          <td class="table__body-cell">{{ formatMoney(payment.amount) }}</td>
          <td class="table__body-cell">{{ formatMoney(Math.round(payment.remainingDebt)) }}</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from "vue"

const props = defineProps<{
  yearsOld: number | null,
  sumCredit: number,
  monthlyPayment: number,
  overpayment: number,
  manualActive: boolean,
  selectedYear?: number | null,
  containerRef?: HTMLElement | null,
  buttonsRef?: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'update:yearsCount', value: number): void,
  (e: 'scrollActiveYear', value: number | null): void
}>()

interface Payment {
  month: string
  year: string
  amount: number
  remainingDebt: number
}

export interface PaymentTableExpose {
  scrollToYear: (year: number) => void
}


// Скролл по годам
const yearRowRefs = ref<Map<string, HTMLElement>>(new Map())
const tableHeadRef = ref<HTMLElement | null>(null)

watch(() => props.selectedYear, (newYear) => {
  if (newYear) {
    nextTick(() => {
      scrollToYear(newYear)
    })
  } else {
    nextTick(() => {
      scrollToYear(0)
    })
  }
}, { immediate: true })

// Очищаем рефы при обновлении данных
watch(() => props.yearsOld, () => {
  yearRowRefs.value.clear()
}, { immediate: true })


const setYearRowRef = (el: HTMLElement | null, year: string) => {
  if (el) {
    yearRowRefs.value.set(year, el)
  } else {
    yearRowRefs.value.delete(year)
  }
}

const scrollToYear = (year: number): void => {
  if (year === 0) {
    props.containerRef?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    return
  }

  const element = document.getElementById(`year-${year}`)

  if (!element) return

  // Временное решение - убираем sticky и прокручиваем
  const originalPosition = element.style.position
  const originalTop = element.style.top

  // Временно убираем sticky
  element.style.position = 'static'

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })

  // Возвращаем sticky через небольшую задержку
  setTimeout(() => {
    element.style.position = originalPosition || 'sticky'
    element.style.top = originalTop || '127px'
  }, 500)
}

// Экспортируем метод
defineExpose<PaymentTableExpose>({
  scrollToYear
})


// Определение года по скроллу
let visibleYear = ref<string | null>('')

const checkVisibleYear = () => {
  if (props.manualActive) return

  if (!props.containerRef) return

  const container = props.containerRef

  const containerRect = container.getBoundingClientRect()

  const stickyButtonsHeight = props.buttonsRef?.clientHeight || 87
  const stickyHeadHeight = tableHeadRef.value?.clientHeight || 48
  const totalStickyHeight = stickyButtonsHeight + stickyHeadHeight

  if (container.scrollTop < totalStickyHeight) {
    visibleYear.value = null
    return
  }

  // Верхняя граница видимой области после sticky
  const visibleTop = containerRect.top + totalStickyHeight

  yearRowRefs.value.forEach((element, year) => {
    const rect = element.getBoundingClientRect()

    const isVisible = (
      rect.bottom > containerRect.top && // rect.bottom - расстояние от верхней границы экрана до нижнего края элемента
      rect.top < containerRect.bottom // containerRect.bottom - видимая часть низа контейнера при прорутке относительно окна браузера
    )

    if (isVisible) {
      // 2. Проверяем, насколько близко к верхнему краю
      const distanceToTop = Math.abs(rect.top - visibleTop)

      // Если элемент в верхней части (в пределах 100px от верха)
      if (distanceToTop < 100) {

        // Обновляем visibleYear, если этот год ближе к верху
        if (!visibleYear.value || distanceToTop < 10) {
          visibleYear.value = year
        }
      }
    }
  })
}

watch(() => visibleYear.value, (newYear) => {
  if (props.manualActive) return

  emit('scrollActiveYear', newYear ? Number(newYear) : null)
})

onMounted(() => {
  nextTick(() => {
    if (props.containerRef) {
      props.containerRef.addEventListener('scroll', checkVisibleYear)
      setTimeout(checkVisibleYear, 500)
    }
  })
})



// Логика графика платежей
const paymentSchedule = ref<Payment[]>([])

const sumCreditWithPercent = computed(() => {
  return props.overpayment + props.sumCredit
})

// Функция для получения всех годов из графика платежей
const getPaymentYears = computed(() => {
  if (!paymentSchedule.value.length) return []

  const years = new Set<string>()

  paymentSchedule.value.forEach(payment => {
    years.add(payment.year)
  })

  return years.size
})

watch(getPaymentYears, (newCount) => {
  emit('update:yearsCount', newCount as number)
}, { immediate: true })

const isShowYear = (index: number, payment: Payment) => {
  if (!paymentSchedule.value.length) return false

  if (index === 0) return true

  const prevPayment = paymentSchedule.value[index - 1]
  return prevPayment ? payment.year !== prevPayment.year : false
}

const formatMonth = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    month: 'long'
  })
}

const formatYear = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric'
  })
}

// Форматирование денег
const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

// Функция расчета графика платежей
const calculatePaymentSchedule = (years: number) => {
  const schedule: Payment[] = []

  // Конвертируем годы в месяцы (с учетом дробной части)
  const totalMonths = Math.ceil(years * 12)

  // Текущая дата для первого платежа (следующий месяц)
  const currentDate = new Date()
  let paymentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

  let remainingDebt = sumCreditWithPercent.value

  for (let month = 1; month <= totalMonths; month++) {
    // Для последнего месяца корректируем платеж, чтобы остаток стал 0
    let paymentAmount = props.monthlyPayment

    if (month === totalMonths) {
      paymentAmount = remainingDebt // Последний платеж = оставшийся долг
    }

    // Уменьшаем остаток долга
    remainingDebt = Math.max(0, remainingDebt - paymentAmount)

    // Добавляем запись в график
    schedule.push({
      month: formatMonth(paymentDate),
      year: formatYear(paymentDate),
      amount: paymentAmount,
      remainingDebt: remainingDebt
    })

    // Переходим к следующему месяцу
    paymentDate.setMonth(paymentDate.getMonth() + 1)
  }

  return schedule
}

watch(() => props.yearsOld, (newVal) => {
  if (newVal && props.sumCredit && props.monthlyPayment) {
    paymentSchedule.value = calculatePaymentSchedule(newVal)
  }
}, { immediate: true })

watch([() => props.sumCredit, () => props.monthlyPayment], () => {
  if (props.yearsOld) {
    paymentSchedule.value = calculatePaymentSchedule(props.yearsOld)
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.table {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 30px;
  margin-inline: 0;

  &__head {
    position: sticky;
    top: 80px;
    z-index: 100;
    background-color: white;
    &-row {
      display: flex;
      width: 100%;
    }

    &-title {
      flex: 1;
      font-weight: 600;
      padding: 12px;
      text-align: center;
      //border-bottom: 2px solid #ddd;
    }
  }

  &__body {
    width: 100%;
    display: flex;
    flex-direction: column;

    &-row {
      display: flex;
      text-align: center;

      &:last-child {
        margin-bottom: 40px;
      }

      &--year-separator {
        position: sticky;
        top: 127px;
        z-index: 50;
        background-color: white;
        scroll-margin-top: 125px;
      }
    }

    &-cell {
      flex: 1; /* Равномерное распределение */
      padding: 10px 12px;
      //border-bottom: 1px solid #eee;
      border-bottom: 1px solid #d5d5d5;

      &--year {
        background-color: #efefef;
      }
    }
  }
}

@media (max-width: 767px) {
  .table {
    &__head-title {
      font-size: 14px;
    }
  }
}
@media (max-width: 500px) {
  .table {
    &__head-title {
      font-size: 12px;
    }
    &__body-cell {
      font-size: 14px;
    }
  }
}

@media (max-width: 390px) {
  .table {
    &__head-title {
      font-size: 10px;
    }
  }
}
</style>
