<template>
  <div class="cards__search--input-group">
    <input
      id="minPrice"
      :value="formattedValue"
      @input="inputEvent"
      @keydown="keyDownEvent"
      :type="type"
      inputmode="numeric"
      :class="[inputClass, { 'cards__search--color': active }]"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
    />
    <span
      v-if="modelValue"
      class="cards__search--close-filter"
      @click="closeClick"
    >
    </span>
  </div>
</template>

<script setup lang="ts">
import { useFormatters } from '@/composables/formatters.ts'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number | null,
  type?: string,
  inputClass: string,
  active: boolean,
  placeholder: string,
  autocomplete?: string,
}>(), {
  type: 'text',
  autocomplete: 'off'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void,
  (e: 'close-click'): void
}>()

const { formatNumber, parseNumber, allowOnlyNumbers } = useFormatters()

const formattedValue = computed((): string => {
  return formatNumber(props.modelValue) || ''
})

function inputEvent(event: InputEvent): void {
  const value = parseNumber((event.target as HTMLInputElement).value)
  emit('update:modelValue', value)
}

function keyDownEvent(event: KeyboardEvent): void {
  allowOnlyNumbers(event)
}

function closeClick(): void {
  emit('update:modelValue', null)
  emit('close-click')
}

</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.cards__search {
  @include cards-search-styles;
  &--change-width {
    width: calc(280px / 2);
  }

  &--one {
    border-radius: 10px 0 0 10px;
    appearance: textfield;
  }

  &--two {
    border-radius: 0 10px 10px 0;
  }

  &--color {
    background-color: #cee3ed;
  }
}

.cards__search--close-filter {
  @include close-filter-styles;
}

.cards__search--input-group {
  position: relative;
}

@media (max-width: 767px) {
  .cards__search {
    &--change-width {
      width: calc(250px / 2);
    }
  }
}

@media (max-width: 660px) {
  .cards__search {
    font-size: 12px;
    &--change-width {
      width: calc(200px / 2);
    }
  }
}

</style>
