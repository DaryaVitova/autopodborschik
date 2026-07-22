<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'btn--icon': iconOnly }]"
    :disabled="disabled"
  >
    <span v-if="$slots.leading" class="btn__icon"><slot name="leading" /></span>
    <span v-if="!iconOnly" class="btn__label"><slot /></span>
    <slot v-else />
    <span v-if="$slots.trailing" class="btn__icon"><slot name="trailing" /></span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    block?: boolean
    iconOnly?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    block: false,
    iconOnly: false,
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.btn {
  --btn-h: 44px;
  --btn-px: var(--space-5);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: var(--btn-h);
  padding: 0 var(--btn-px);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease),
    border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
    transform var(--dur-fast) var(--ease);

  &:active {
    transform: translateY(1px);
  }
  &:focus-visible {
    @include focus-ring;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &--sm {
    --btn-h: 36px;
    --btn-px: var(--space-4);
    font-size: var(--text-sm);
  }
  &--lg {
    --btn-h: 52px;
    --btn-px: var(--space-8);
    font-size: var(--text-lg);
  }
  &--block {
    display: flex;
    width: 100%;
  }
  &--icon {
    width: var(--btn-h);
    padding: 0;
  }

  // ---- Variants ----
  &--primary {
    background: var(--primary);
    color: var(--on-primary);
    box-shadow: var(--shadow-primary);
    &:hover:not(:disabled) {
      background: var(--primary-hover);
      box-shadow: var(--shadow-lg);
    }
  }
  &--secondary {
    background: var(--surface);
    color: var(--primary);
    border-color: var(--primary);
    &:hover:not(:disabled) {
      background: var(--primary-soft);
      box-shadow: var(--shadow-sm);
    }
  }
  &--ghost {
    background: transparent;
    color: var(--ink-muted);
    &:hover:not(:disabled) {
      background: var(--surface-3);
      color: var(--ink);
    }
  }
  &--danger {
    background: transparent;
    color: var(--danger);
    &:hover:not(:disabled) {
      background: var(--danger-soft);
    }
  }
}

.btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
