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
  (e: 'input'): void
}>()

function handleInput(e: InputEvent): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  emit('input')
}

function closeClick(): void {
  emit('update:modelValue', '')
}

</script>

<style lang="scss">
@use '@/assets/scss/mixins' as *;

.cards__search {
  @include cards-search-styles;

  &--close-filter {
    @include close-filter-styles;
  }

  &--input-group {
    position: relative;
  }

  &::placeholder {
    color: #7e7e7e;
  }
}


@media (max-width: 767px) {
  .cards__search {
    width: 250px;
  }
}

@media (max-width: 660px) {
  .cards__search {
    width: 200px;
    font-size: 12px;
  }
}

</style>
