<template>
  <div class="select" :class="{ 'select--error': !!error }">
    <label v-if="label" :id="`${fieldId}-label`" class="select__label">{{ label }}</label>
    <button
      :id="fieldId"
      ref="triggerEl"
      type="button"
      class="select__trigger"
      :class="{ 'select__trigger--open': open, 'select__trigger--placeholder': !selected }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${fieldId}-list`"
      :aria-labelledby="label ? `${fieldId}-label ${fieldId}` : undefined"
      @click="toggle"
      @keydown="onTriggerKeydown"
      @blur="onBlur"
    >
      <span class="select__value">{{ selected ? selected.label : placeholder }}</span>
      <ChevronDown class="select__chevron" :class="{ 'select__chevron--open': open }" :size="18" />
    </button>

    <Transition name="pop">
      <ul
        v-show="open"
        :id="`${fieldId}-list`"
        ref="listEl"
        class="select__list"
        role="listbox"
        :aria-labelledby="label ? `${fieldId}-label` : undefined"
        :aria-activedescendant="activeIndex >= 0 ? `${fieldId}-opt-${activeIndex}` : undefined"
        tabindex="-1"
      >
        <li
          v-for="(opt, i) in options"
          :id="`${fieldId}-opt-${i}`"
          :key="opt.value"
          class="select__option"
          :class="{ 'select__option--active': i === activeIndex, 'select__option--selected': opt.value === model }"
          role="option"
          :aria-selected="opt.value === model"
          @mousedown.prevent="choose(i)"
          @mousemove="activeIndex = i"
        >
          <span>{{ opt.label }}</span>
          <Check v-if="opt.value === model" class="select__check" :size="16" />
        </li>
      </ul>
    </Transition>

    <span v-if="error" class="select__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, useId } from 'vue'
import { ChevronDown, Check } from '@lucide/vue'

export interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    options: SelectOption[]
    placeholder?: string
    label?: string
    error?: string | false | null
    id?: string
  }>(),
  { placeholder: 'Выберите значение' },
)

const model = defineModel<string>()

const generatedId = useId()
const fieldId = props.id ?? generatedId
const open = ref(false)
const activeIndex = ref(-1)
const triggerEl = ref<HTMLButtonElement | null>(null)
const listEl = ref<HTMLUListElement | null>(null)

const selected = computed(() => props.options.find((o) => o.value === model.value) ?? null)

function openList() {
  open.value = true
  activeIndex.value = props.options.findIndex((o) => o.value === model.value)
  if (activeIndex.value < 0) activeIndex.value = 0
  nextTick(scrollActiveIntoView)
}
function closeList() {
  open.value = false
}
function toggle() {
  open.value ? closeList() : openList()
}
function choose(i: number) {
  const opt = props.options[i]
  if (!opt) return
  model.value = opt.value
  closeList()
  triggerEl.value?.focus()
}
function scrollActiveIntoView() {
  const el = listEl.value?.querySelector<HTMLElement>(`#${fieldId}-opt-${activeIndex.value}`)
  el?.scrollIntoView({ block: 'nearest' })
}
function onBlur() {
  // Allow option mousedown to fire before closing.
  requestAnimationFrame(() => {
    if (document.activeElement !== triggerEl.value) closeList()
  })
}
function onTriggerKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (!open.value) return openList()
      activeIndex.value = Math.min(activeIndex.value + 1, props.options.length - 1)
      scrollActiveIntoView()
      break
    case 'ArrowUp':
      e.preventDefault()
      if (!open.value) return openList()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      scrollActiveIntoView()
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      open.value ? choose(activeIndex.value) : openList()
      break
    case 'Escape':
      if (open.value) {
        e.preventDefault()
        closeList()
      }
      break
    case 'Tab':
      closeList()
      break
    case 'Home':
      if (open.value) {
        e.preventDefault()
        activeIndex.value = 0
        scrollActiveIntoView()
      }
      break
    case 'End':
      if (open.value) {
        e.preventDefault()
        activeIndex.value = props.options.length - 1
        scrollActiveIntoView()
      }
      break
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.select {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;

  &__label {
    margin-bottom: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink-muted);
  }

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    width: 100%;
    height: 48px;
    padding: 0 var(--space-4);
    background: var(--surface);
    color: var(--ink);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    text-align: left;
    cursor: pointer;
    transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);

    &:hover {
      border-color: var(--ink-faint);
    }
    &--open,
    &:focus-visible {
      outline: none;
      border-color: var(--primary);
      @include focus-ring;
    }
    &--placeholder .select__value {
      color: var(--ink-faint);
    }
  }

  &__value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    flex-shrink: 0;
    color: var(--ink-muted);
    transition: transform var(--dur) var(--ease);
    &--open {
      transform: rotate(180deg);
    }
  }

  &__list {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: var(--z-dropdown);
    margin: 0;
    padding: var(--space-1);
    list-style: none;
    max-height: 280px;
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-3);
    border-radius: var(--radius-sm);
    color: var(--ink);
    cursor: pointer;

    &--active {
      background: var(--surface-3);
    }
    &--selected {
      color: var(--primary);
      font-weight: 600;
    }
  }

  &__check {
    color: var(--primary);
    flex-shrink: 0;
  }

  &__error {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: var(--space-1);
    font-size: var(--text-xs);
    color: var(--danger);
  }

  &--error &__trigger {
    border-color: var(--danger);
  }
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease-out);
  transform-origin: top center;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
