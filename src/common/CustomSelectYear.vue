<template>
  <div
    :class="changeTextColor ? 'custom-select custom-select--none-shadow' : 'custom-select'"
    @click="toggleDropdown"
  >
    <div :class="changeTextColor ? 'custom-select__value custom-select__value--color' : 'custom-select__value'"
    >
      {{ modelValue || placeholderText }}
    </div>
    <div
      class="custom-select__dropdown"
      v-show="isOpen"
    >
      <div
        class="custom-select__option custom-select__option--reset"
        @click.stop="resetSelection"
      >
        <span class="custom-select__cross">✕</span> Сбросить
      </div>
      <div
        :class="!isYearDisabled(year) ? 'custom-select__option' : 'custom-select__option custom-select__option--disabled'"
        v-for="year in yearRange"
        :key="year"
        @click.stop="!isYearDisabled(year) && selectYear(year)"
      >
        {{ year }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number | null | string,
  placeholderText: string,
  changeTextColor?: boolean,
  startYear?: number,
  endYear?: number,
  disabledBefore?: number | null,
  disabledAfter?: number | null,
  isOpen?: boolean,
}>(), {
  changeTextColor: false,
  startYear: 1960,
  endYear: new Date().getFullYear(),
  disabledBefore: null,
  disabledAfter: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void,
  (e: 'toggle'): void,
  (e: 'close'): void,
}>()

const yearRange = computed((): number[] => {
  const years = []
  for (let year = props.endYear; year >= props.startYear; year--) {
    years.push(year)
  }
  return years
})

function isYearDisabled(year: number): boolean {
  if (props.disabledBefore && year < props.disabledBefore ||
    props.disabledAfter && year > props.disabledAfter) {
    return true
  }
  return false
}

function toggleDropdown(): void {
  emit('toggle')
}

function selectYear(year: number): void {
  if (!isYearDisabled(year)) {
    emit('update:modelValue', year)
    emit('close')
  }
}

function resetSelection(): void {
  emit('update:modelValue', null)
  emit('close')
}

function handleClickOutside(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest('.custom-select')) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss">
.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
  padding: 3px;
  background-color: var(--surface);
  color: var(--ink);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  z-index: 1000;
  &__value {
    color: var(--ink);
    &--color {
      color: var(--ink-faint);
    }
  }

  &--none-shadow {
    box-shadow: none;
  }

  &__dropdown {
    width: 100%;
    position: absolute;
    top: 110%;
    left: 0;
    right: 0;
    background-color: var(--surface);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  &__option {
    padding: 8px;
    cursor: pointer;
    text-align: center;

    &:hover {
      background-color: var(--surface-3);
    }

    &--disabled {
      cursor: not-allowed;
      color: var(--ink-faint);
      background-color: var(--surface-2);
      &:hover {
        background-color: var(--surface-2);
      }
    }
  }

  &__cross {
    margin-right: 7px;
  }
}
</style>
