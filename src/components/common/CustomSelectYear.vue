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
      v-show="isDropdownOpen"
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
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number | null | string,
  placeholderText: string,
  changeTextColor?: boolean,
  startYear?: number,
  endYear?: number,
  disabledBefore?: number | null,
  disabledAfter?: number | null,
}>(), {
  changeTextColor: false,
  startYear: 1960,
  endYear: new Date().getFullYear(),
  disabledBefore: null,
  disabledAfter: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const isDropdownOpen = ref<boolean>(false)

const yearRange = computed((): number[] => {
  const years = []
  for (let year = props.endYear; year >= props.startYear; year--) {
    years.push(year)
  }
  return years
})

function isYearDisabled(year: number): boolean {
  if (props.disabledBefore && year < props.disabledBefore) {
    return true
  }
  // Если есть disabledAfter и год больше этого значения
  if (props.disabledAfter && year > props.disabledAfter) {
    return true
  }

  return false
}

function toggleDropdown(): void {
  isDropdownOpen.value = !isDropdownOpen.value
}

function selectYear(year: number): void {
  if (!isYearDisabled(year)) {
    emit('update:modelValue', year)
    isDropdownOpen.value = false
  }
}

function resetSelection(): void {
  emit('update:modelValue', null)
  isDropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest('.custom-select')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
  padding: 3px;
  background-color: white;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  &__value {
    color: #090909;
    &--color {
      color: #676666;
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
    background-color: white;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
  }

  &__option {
    padding: 8px;
    cursor: pointer;
    text-align: center;

    &:hover {
      background-color: #f6f6f6;
    }

    &--disabled {
      cursor: not-allowed;
      background-color: #e4e4e4;
      &:hover {
        background-color: #e4e4e4;
      }
    }
  }

  &__cross {
    margin-right: 7px;
  }
}
</style>
