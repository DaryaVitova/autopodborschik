<template>
  <label class="switch" :class="{ 'switch--on': model }">
    <input v-model="model" type="checkbox" class="switch__input" />
    <span class="switch__track" aria-hidden="true">
      <span class="switch__thumb" />
    </span>
    <span class="switch__text"><slot /></span>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;

  // Kept in the accessibility tree and focusable — only visually replaced by
  // the track/thumb below, so keyboard and screen readers get a real checkbox.
  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &__track {
    position: relative;
    flex-shrink: 0;
    width: 38px;
    height: 22px;
    // Light neutral that still reads against the white thumb, which carries a
    // shadow to separate the two.
    background: var(--border-strong);
    border-radius: var(--radius-pill);
    transition: background-color var(--dur) var(--ease);
  }

  &__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    background: var(--on-primary);
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
    transition: transform var(--dur) var(--ease-spring);
  }

  &__text {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink-muted);
    transition: color var(--dur) var(--ease);
  }

  &:hover &__track {
    background: var(--ink-faint);
  }

  &--on &__track,
  &--on:hover &__track {
    background: var(--primary);
  }
  &--on &__thumb {
    transform: translateX(16px);
  }
  // Brand blue rather than near-black --ink, to match the active track.
  &--on &__text {
    color: var(--primary);
  }

  &__input:focus-visible + &__track {
    @include focus-ring;
  }
}
</style>
