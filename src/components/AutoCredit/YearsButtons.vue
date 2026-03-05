<template>
  <div class="years-buttons">
    <button
      class="years-buttons__btn"
      @click.stop="selectAllYears"
      :class="{ active: selectedYear === null }"
    >
      Весь срок
    </button>
    <button
      class="years-buttons__btn"
      v-for="year in rangeYears"
      :key="year"
      @click.stop="selectYear(year)"
      :class="{ active: selectedYear === year }"
    >{{ year }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"

const props = defineProps<{
  yearsOld: number,
  updateSelectYear: number | null
}>()

const emit = defineEmits<{
  (e: 'select-year', year: number | null ): void,
  (e: 'manual-select'): void
}>()

const selectedYear = ref<number | null>(null)

watch(() => props.updateSelectYear, (newVal) => {
  selectedYear.value = newVal
})

const rangeYears = computed((): number[] => {
  const currentYear = new Date().getFullYear()

  const years = []
  console.log('props.yearsOld::', props.yearsOld)
  for (let i = 0; i < props.yearsOld; i++) {
    years.push(currentYear + i)
  }

  return years
})

function selectYear(year: number) {
  selectedYear.value = year
  emit('select-year', year)
  emit('manual-select')
}

function selectAllYears() {
  selectedYear.value = null
  emit('select-year', null)
  emit('manual-select')
}
</script>

<style lang="scss" scoped>
.years-buttons {
  --background-color: #eae8e8;
  --active-color: green;
  --text-color: #333;
  --active-text-color: white;
  --indent: 15px;
  --half-indent: calc(var(--indent) / 2);

  display: flex;
  align-items: center;
  width: fit-content;
  max-width: 90%;
  background-color: var(--background-color);
  border-radius: 10px;
  margin: 30px 0 0 30px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  &__btn {
    position: relative;
    background-color: transparent;
    border: none;
    padding: 8px 10px;
    cursor: pointer;
    color: var(--text-color);
    font-size: 14px;

    &:not(:last-child) {
      margin-right: var(--indent);
      &::after {
        content: "|";
        position: absolute;
        right: calc(var(--indent) / -2);
        color: #999;
        pointer-events: none;
        font-weight: 300;
        transition: opacity 0.3s;
      }
    }

    &.active {
      background-color: var(--active-color);
      color: var(--active-text-color);
      border-radius: 6px;

      &:not(:last-child) {
        margin-right: var(--half-indent);
      }

      &::after {
        display: none;
      }
    }
  }
}
</style>
