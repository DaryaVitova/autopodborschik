<template>
  <div
    class="segmented"
    role="radiogroup"
    :aria-label="ariaLabel"
    :style="{ '--seg-count': options.length, '--seg-active': activeIndex }"
  >
    <span class="segmented__indicator" aria-hidden="true" />
    <button
      v-for="(opt, i) in options"
      :key="opt.value"
      type="button"
      class="segmented__option"
      :class="{ 'segmented__option--active': opt.value === model }"
      role="radio"
      :aria-checked="opt.value === model"
      :tabindex="opt.value === model ? 0 : -1"
      @click="select(opt.value)"
      @keydown="onKeydown($event, i)"
    >
      <slot name="option" :option="opt">{{ opt.label }}</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SegmentOption {
  value: string
  label: string
}

const props = defineProps<{
  options: SegmentOption[]
  ariaLabel?: string
}>()

const model = defineModel<string>()

const activeIndex = computed(() => {
  const i = props.options.findIndex((o) => o.value === model.value)
  return i < 0 ? 0 : i
})

function select(value: string) {
  model.value = value
}

function onKeydown(e: KeyboardEvent, index: number) {
  let next = index
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % props.options.length
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
    next = (index - 1 + props.options.length) % props.options.length
  else return
  e.preventDefault()
  const opt = props.options[next]
  if (opt) {
    model.value = opt.value
    const buttons = (e.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>(
      '.segmented__option',
    )
    buttons?.[next]?.focus()
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.segmented {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--seg-count), 1fr);
  padding: 4px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);

  &__indicator {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    width: calc((100% - 8px) / var(--seg-count));
    background: var(--surface);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-sm);
    transform: translateX(calc(var(--seg-active) * 100%));
    transition: transform var(--dur) var(--ease-spring);
  }

  &__option {
    position: relative;
    z-index: 1;
    padding: var(--space-3) var(--space-4);
    border: none;
    background: transparent;
    border-radius: var(--radius-pill);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink-muted);
    cursor: pointer;
    transition: color var(--dur) var(--ease);

    &:hover {
      color: var(--ink);
    }
    &--active {
      color: var(--primary);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
}
</style>
