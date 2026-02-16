<template>
  <div class="price-slider">
    <div class="price-slider__container">
      <div class="price-slider__label">
        <span class="price-slider__label--text">{{ label }}</span>
        <input
          type="text"
          v-model="displayValue"
          class="price-slider__handle-input"
          @input="handleInput"
          @blur="handleBlur"
          @keyup.enter="handleBlur"
          @focus="handleFocus"
        >
      </div>

      <input
        type="range"
        v-model.number="rangeModel"
        class="price-slider__input"
        :min="effectiveMinValue"
        :max="effectiveMaxValue"
        :step="stepValue"
        @input="updateProgress"
        aria-labelledby="price-slider__label"
        ref="sliderRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from "vue"
import { useFormatters } from "@/composables/useFormatters.ts"

const props = withDefaults(defineProps<{
  minValue?: number,
  maxValue: number,
  stepValue?: number,
  label: string,
  minLock?: boolean,
  downPayment?: boolean,
  priceAuto: number
}>(), {
  minValue: 10000,
  stepValue: 5000,
  downPayment: false
})

const { formatNumber } = useFormatters()

const rangeModel = defineModel<number>({ required: true })
const displayValue = ref<string>('')
const sliderRef = ref<HTMLInputElement | null>(null)
const isEditing = ref<boolean>(false)

const effectiveMinValue = computed(() => {
  if (props.downPayment && props.priceAuto) {
    return props.priceAuto * 0.1
  }
  return props.minValue
})

const effectiveMaxValue = computed(() => {
  if (props.downPayment && props.priceAuto) {
    return Math.max(props.priceAuto - 50000, effectiveMinValue.value)
  }
  return props.maxValue
})

const updateProgress = (): void => {
  if (sliderRef.value) {
    const value = rangeModel.value

    const range = effectiveMaxValue.value - effectiveMinValue.value
    if (range === 0) {
      sliderRef.value.style.setProperty('--progress', '0%')
      return
    }

    if (props.downPayment && rangeModel.value === props.priceAuto * 0.1) {
      sliderRef.value.style.setProperty('--progress', '0%')
      return
    }

    const percent = ((value - effectiveMinValue.value) / range) * 100
    const safePercent = Math.max(0, Math.min(100, percent))

    sliderRef.value.style.setProperty('--progress', `${safePercent}%`)
  }
}

watch(() => rangeModel.value, (newVal) => {
  if (!isEditing.value) {
    displayValue.value = formatNumber(newVal) as string
  }
  updateProgress()
}, { immediate: true })

// Обновляем прогресс при изменении границ
watch(() => effectiveMaxValue.value, () => {
  updateProgress()
})

watch(() => effectiveMinValue.value, () => {
  updateProgress()
})

watch(() => props.priceAuto, () => {
  if (props.downPayment) {
    const minValueDownPayment = props.priceAuto * 0.1
    const maxValueDownPayment = props.priceAuto - 50000

    // Если текущее значение вне новых границ, корректируем его
    if (rangeModel.value < minValueDownPayment) {
      rangeModel.value = minValueDownPayment
    } else if (rangeModel.value > maxValueDownPayment) {
      rangeModel.value = maxValueDownPayment
    }
  }
})


watch(() => displayValue.value, (newVal) => {
  if (!newVal || newVal === '') {
    displayValue.value = ''
    return
  } else {
    const numValue = parseFloat(newVal.replace(/\D/g, ''))
    displayValue.value = formatNumber(numValue) as string
  }
})


const handleFocus = () => {
  isEditing.value = true
  // displayValue.value = rangeModel.value.toString().replace(/\s+/g, '')
}

const handleInput = (event: Event) => {
  isEditing.value = true
  const target = event.target as HTMLInputElement
  let rawValue = target.value.replace(/\D/g, '')

  if (rawValue.length > 9) {
    rawValue = rawValue.substring(0, 9)
  }

  displayValue.value = rawValue

  // Обновляем в реальном времени
  const numValue = parseInt(rawValue) || effectiveMinValue.value
  const limitedValue = Math.max(effectiveMinValue.value, Math.min(numValue, effectiveMaxValue.value))
  rangeModel.value = limitedValue

  nextTick(() => {
    updateProgress()
  })
}

const handleBlur = () => {
  isEditing.value = false

  if (!displayValue.value) {
    displayValue.value = formatNumber(rangeModel.value) as string
    return
  }

  const rawValue = displayValue.value.replace(/\D/g, '')
  let numValue = parseInt(rawValue) || effectiveMinValue.value

  numValue = Math.max(effectiveMinValue.value, Math.min(numValue, effectiveMaxValue.value))

  rangeModel.value = numValue
  displayValue.value = formatNumber(numValue) as string
  updateProgress()
}

onMounted(() => {
  nextTick(() => {
    updateProgress()
  })
})
</script>

<style lang="scss" scoped>
.price-slider {
  &__container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
    width: 500px;
    background-color: #dbe5ec;
    padding: 7px 5px 0 0;
    border-radius: 10px 10px 0 0;
    height: 80px;

    @media (max-width: 1130px) {
      width: 450px;
    }
  }

  &__handle-input {
    background: none;
    border: none;
    outline: none;
    box-shadow: none;
    color: #031220;
    font: inherit;
    font-size: 18px;
    font-weight: bold;
    padding: 0;
    margin: 0;
    width: 150px;
    cursor: text;

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }

  &__label {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 7px;
    margin-left: 13px;

    &--text {
      color: #676666;
    }

    strong {
      color: #031220;
      font-size: 18px;
    }
  }

  &__input {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 6px;
    margin: 0;
    background: transparent;
    appearance: none;
    cursor: pointer;
    outline: none;

    --progress: 50%;

    &::-webkit-slider-runnable-track {
      //position: relative;
      width: 100%;
      height: 6px;
      background: linear-gradient(
          to right,
          #118021 0%,
          #118021 var(--progress, 50%),
          #c1c1c1 var(--progress, 50%),
          #c1c1c1 100%
      );
      border-radius: 0;
      border: none;
    }

    &::-webkit-slider-thumb {
      position: absolute;
      left: var(--progress);
      transform: translateX(-50%);
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #03420c;
      cursor: pointer;
      margin-top: -7px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s;
    }

    /* Стили для Firefox */
    &::-moz-range-track {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 0;
      border: none;
    }

    &::-moz-range-progress {
      height: 6px;
      background: #118021;
      border-radius: 0;
    }

    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #03420c;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
