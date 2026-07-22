<template>
  <div class="field" :class="{ 'field--error': !!error }">
    <label v-if="label" :for="fieldId" class="field__label">{{ label }}</label>
    <div class="field__control">
      <span v-if="$slots.leading" class="field__affix field__affix--leading">
        <slot name="leading" />
      </span>
      <input
        :id="fieldId"
        ref="inputEl"
        class="field__input"
        :class="{ 'field__input--mono': mono, 'field__input--has-leading': !!$slots.leading }"
        :type="type"
        :inputmode="inputmode"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :value="model ?? ''"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${fieldId}-err` : undefined"
        @input="onInput"
      />
      <span v-if="$slots.trailing" class="field__affix field__affix--trailing">
        <slot name="trailing" />
      </span>
    </div>
    <Transition name="err">
      <span v-if="error" :id="`${fieldId}-err`" class="field__error">{{ error }}</span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    error?: string | false | null
    placeholder?: string
    type?: 'text' | 'number' | 'tel'
    inputmode?: 'text' | 'numeric' | 'decimal' | 'tel'
    maxlength?: number | string
    mono?: boolean
    id?: string
    transform?: (raw: string) => string
  }>(),
  { type: 'text' },
)

const model = defineModel<string | number | null>()

const generatedId = useId()
const fieldId = props.id ?? generatedId
const inputEl = ref<HTMLInputElement | null>(null)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  let raw = target.value
  if (props.transform) {
    raw = props.transform(raw)
    // Reflect transformed value back into the DOM (e.g. uppercased VIN).
    if (target.value !== raw) target.value = raw
  }
  if (props.type === 'number') {
    model.value = raw === '' ? null : Number(raw)
  } else {
    model.value = raw
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.field {
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;

  &__label {
    margin-bottom: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink-muted);
  }

  &__control {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__input {
    width: 100%;
    box-sizing: border-box;
    height: 48px;
    padding: 0 var(--space-4);
    background: var(--surface);
    color: var(--ink);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
      background-color var(--dur) var(--ease);

    &::placeholder {
      color: var(--ink-faint);
    }
    &--mono {
      font-family: var(--font-mono);
      letter-spacing: 0.04em;
    }
    &--has-leading {
      padding-left: var(--space-10);
    }
    &:hover {
      border-color: var(--ink-faint);
    }
    &:focus {
      outline: none;
      border-color: var(--primary);
      @include focus-ring;
    }
  }

  &__affix {
    position: absolute;
    display: inline-flex;
    align-items: center;
    color: var(--ink-faint);
    pointer-events: none;
    &--leading {
      left: var(--space-3);
    }
    &--trailing {
      right: var(--space-3);
      pointer-events: auto;
    }
  }

  &__error {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: var(--space-1);
    font-size: var(--text-xs);
    color: var(--danger);
  }

  &--error &__input {
    border-color: var(--danger);
    &:focus {
      box-shadow: 0 0 0 3px var(--danger-soft);
    }
  }
}

.err-enter-active,
.err-leave-active {
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.err-enter-from,
.err-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
