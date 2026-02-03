<template>
  <div class="calculate-credit__right-side-elem">
    <span class="calculate-credit__right-side-elem--text">{{ label }}</span>
    <span class="calculate-credit__right-side-elem--value">{{ value }}<span v-if="percent">%</span></span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string,
  value?: number | string,
  percent?: boolean
}>(), {
  percent: false
})
</script>

<style lang="scss" scoped>
.calculate-credit {
  &__right-side-elem {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: center;
    justify-content: center;
    width: 50%;

    &--text {
      color: gray;
    }

    &--value {
      font-size: 22px;
      font-weight: 500;
      line-height: 28px;
    }
  }
}
</style>
