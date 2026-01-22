<template>
  <div v-show="openInput" class="table__header-input">
    <input
      class="table__header-input--input"
      ref="inputRef"
      placeholder="Поиск..."
      :value="localInputValue"
      @input="handleInput($event)"
    />
    <span
      class="table__header-input-close"
      @click="resetFiltering"
    >
      X
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import type { Headers } from "@/views/TableView.vue";

const props = defineProps<{
  header: Headers,
  openInput: boolean | undefined,
}>()

const emit = defineEmits<{
  (e: 'setSelectColumn', headerKey: string, value: string): void,
  (e: 'reset-filtering', header: Headers, payload: { value: string }): void
}>()

const route = useRoute()

const inputRef = ref<HTMLInputElement | null>(null)
const localInputValue = ref<string>('')

watch(() => route.query, (newQuery) => {
  const searchKey = `search_${props.header.key}`
  if (newQuery[searchKey]) {
    localInputValue.value = newQuery[searchKey] as string
  }
}, { immediate: true })

// Автофокус при открытии инпута
watch(() => props.openInput, async (newVal) => {
  if (newVal && inputRef.value) {
    await nextTick()
    inputRef.value.focus()
  }
})

watch(() => route.query, (newQuery) => {
  const searchKey = `search_${props.header.key}`
  const queryValue = newQuery[searchKey]

  if (queryValue) {
    if (Array.isArray(queryValue)) {
      // Если это массив, берем первый элемент
      localInputValue.value = queryValue[0] || ''
    } else {
      // Если это строка
      localInputValue.value = queryValue
    }
  }
}, { immediate: true })

function handleInput (event: Event) {
  const value = (event.target as HTMLInputElement).value
  localInputValue.value = value
  emit('setSelectColumn', props.header.key, value)
}

function resetFiltering () {
  emit('reset-filtering', props.header, { value: localInputValue.value }) // Теперь передаем строку
  localInputValue.value = ''
}
</script>

<style lang="scss" scoped>
.table__header-input {
  position: absolute;
  bottom: 110%;
  right: 0;
  display: flex;
  align-items: center;
  &--input {
    border: 2px solid #d8d7d7;
    outline: none;
    transition: border-color 0.3s ease;
    padding-left: 5px;
  }
  &-close {
    position: absolute;
    color: #5a5a5a;
    right: 10px;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
