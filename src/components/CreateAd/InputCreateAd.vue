<template>
  <div class="form__group">
    <span v-if="errorData" class="form__error-message">{{ errorText }}</span>
    <label :for="id" class="form__label">{{ labelText }}</label>
    <input
      :id="id"
      :type="type"
      :maxlength="maxLength"
      :value="modelValue ?? ''"
      :class="`form__input ${moreClass || ''}`"
      @input="handleInput"
      @keydown="handleKeyDown"
    >
  </div>
</template>

<script setup lang="ts">
import { useFormatters } from "@/composables/useFormatters.ts"

const { allowOnlyNumbers } = useFormatters()

type InputType = 'text' | 'number' | 'tel' | 'email' | 'password' | 'date'

interface Props {
  modelValue: string | number | null,
  errorData: boolean,
  id: string,
  type?: InputType,
  errorText: string,
  labelText: string,
  moreClass?: string,
  maxLength?: number,
  checkNumber?: boolean,
}

interface Emits {
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'input'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  checkNumber: false,
})

const emit = defineEmits<Emits>()

const handleKeyDown = (event: KeyboardEvent): void => {
  if (props.checkNumber) {
    allowOnlyNumbers(event)
  }
}

function handleInput(e: Event): void {
  if (props.checkNumber) {
    const target = e.target as HTMLInputElement
    const filteredValue = target.value.replace(/\D/g, '')
    if (filteredValue !== target.value) {
      target.value = filteredValue
    }
    emit('update:modelValue', filteredValue)
  } else {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
  }
  emit('input')
}
</script>

<style lang="scss" scoped>
.form {
  &__group {
    width: 100%;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    &--textarea {
      margin-top: 20px;
    }
  }
  &__label {
    color: #616161;
  }
  &__input {
    height: 33px;
    padding-left: 10px;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  &__error-message {
    font-size: 14px;
    color: #bf0606;
  }
}
</style>
