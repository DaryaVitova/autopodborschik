<template>
  <div class="pie-chart">
    <div class="pie-chart__drawing" :style="{ '--percent': dynamicPercent + '%' }">
      <span class="pie-chart__inner-circle" />
    </div>

    <div class="pie-chart__info">
      <div class="pie-chart__info-group">
        <div class="pie-chart__info-square"></div>

        <div class="pie-chart__info-sum-and-label">
          <span class="pie-chart__info-label">Сумма кредита</span>
          <span class="pie-chart__info-sum">{{ formatNumber(sumCredit) }} ₽</span>
        </div>
      </div>

      <div class="pie-chart__info-group">
        <div class="pie-chart__info-square pie-chart__info-square--two" />

        <div class="pie-chart__info-sum-and-label">
          <span class="pie-chart__info-label">Переплата</span>
          <span class="pie-chart__info-sum">{{ formatNumber(overpayment) }} ₽</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatters } from "@/composables/useFormatters.ts"

const props = defineProps<{
  sumCredit: number,
  overpayment: number
}>()

const { formatNumber } = useFormatters()

const dynamicPercent = computed(() => {
  return props.sumCredit / (props.sumCredit + props.overpayment) * 100
})
</script>

<style lang="scss" scoped>
.pie-chart {
  --color-1: #217a25;
  --color-2: #b5b8b5;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: fit-content;
  padding: 20px;
  background-color: #f1f1f1;
  border-radius: 12px;
  &__drawing {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: conic-gradient(
        var(--color-1) 0% var(--percent),
        var(--color-2) var(--percent) 100%
    );

    /* Белая середина для текста */
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  &__inner-circle {
    background: white;
    width: 45%;
    height: 45%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-left: 10px;

    &-group {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    &-square {
      width: 12px;
      height: 12px;
      border-radius: 20%;
      background-color: var(--color-1);
      &--two {
        background-color: var(--color-2);
      }
    }

    &-sum-and-label {
      display: flex;
      flex-direction: column;
    }

    &-label {
      font-size: 14px;
      color: #737272;
    }
  }
}
</style>
