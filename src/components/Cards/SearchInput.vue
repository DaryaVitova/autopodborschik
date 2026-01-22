<template>
  <div class="cards__search--input-group">
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      class="cards__search"
      @input="handleInput"
      :autocomplete="autocomplete"
    >
    <span
      v-if="showClear && modelValue"
      class="cards__search--close-filter"
      @click="closeClick"
    >
      X
    </span>
  </div>

</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string,
  type?: string,
  placeholder: string,
  autocomplete?: string,
  showClear?: boolean
}>(), {
  type: 'text',
  autocomplete: 'off',
  showClear: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void,
  (e: 'input'): void,
  (e: 'close-click'): void
}>()

function handleInput(e: InputEvent): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  emit('input')
}

function closeClick(): void {
  emit('update:modelValue', '')
  emit('close-click')
}

</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.cards__search {
  @include cards-search-styles;
}

.cards__search--close-filter {
  @include close-filter-styles;
}

.cards__search--input-group {
  position: relative;
}

</style>
