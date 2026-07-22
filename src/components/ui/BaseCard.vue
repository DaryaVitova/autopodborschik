<template>
  <component :is="as" class="card" :class="{ 'card--interactive': interactive, 'card--flush': !padded }">
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    interactive?: boolean
    padded?: boolean
  }>(),
  { as: 'div', interactive: false, padded: true },
)
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.card {
  @include card;
  padding: var(--space-6);

  &--flush {
    padding: 0;
  }
  &--interactive {
    @include hover-lift;
    cursor: pointer;
  }
}
</style>
