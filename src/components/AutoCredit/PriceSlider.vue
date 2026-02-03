<template>
  <div class="price-slider">
    <div class="price-slider__container">
      <div class="price-slider__label">
        <span class="price-slider__label--text">{{ label }}</span>
        <strong>{{ formatNumber(rangeModel) }}</strong>
      </div>

      <input
        type="range"
        v-model.number="rangeModel"
        class="price-slider__input"
        :min="minValue"
        :max="maxValue"
        :step="stepValue"
        @input="updateProgress"
        aria-labelledby="price-slider__label"
        ref="sliderRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue"
import { useFormatters } from "@/composables/useFormatters.ts"

const props = withDefaults(defineProps<{
  minValue?: number,
  maxValue: number,
  stepValue?: number,
  label: string,
  minLock?: boolean
}>(), {
  minValue: 10000,
  stepValue: 5000
})

const { formatNumber } = useFormatters()

const rangeModel = defineModel<number>({ required: true })

const sliderRef = ref<HTMLInputElement | null>(null)

watch(() => props.maxValue, () => {
  updateProgress()
})

// Функция для обновления CSS переменной
const updateProgress = (): void => {
  if (sliderRef.value) {
    const value = Number(sliderRef.value.value)
    const percent = ((value - props.minValue) / (props.maxValue - props.minValue)) * 100
    sliderRef.value.style.setProperty('--progress', `${percent}%`)
  }
}

watch(() => rangeModel.value, (newVal) => {
  console.log(newVal, 'model')
  updateProgress()
})

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
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #03420c;
      cursor: pointer;
      margin-top: -7px; // Центрируем по вертикали
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.1);
      }
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
