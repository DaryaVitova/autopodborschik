<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="table__context-menu"
      :style="menuStyle"
      ref="menuRef"
      @click.stop
    >
      <div
        v-for="(field, idx) in normalizedMenuField"
        :key="idx"
        class="context-menu__item"
        :class="{ 'context-menu__item--disabled': field.disabled }"
        @click="!field.disabled && handleAction(field)"
      >
        {{ field.text }}
        <span v-if="field.disabled" class="context-menu__hint">(последняя)</span>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import type { Headers } from "@/views/TableView.vue";

export interface Position {
  x: number,
  y: number
}

export interface MenuField {
  text: string,
  disabled: boolean // Флаг недоступности
  headerKey?: string | null, // Сохраняем ключ заголовка
  isHidden?: boolean,
  isLastVisible?: boolean
}

interface MenuStyle {
  left: string,
  top: string
}

const props = defineProps<{
  position: Position,
  hiddenColumns: Set<Headers['key']>,
  visible: Boolean,
  menuField: MenuField[]
}>()

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'action', actionName: MenuField): void,
}>()

const menuRef = ref<HTMLDivElement | null>(null)
const menuStyle = ref<MenuStyle | {}>({})

// Нормализуем menuField к единому формату
const normalizedMenuField = computed<MenuField[]>(() => {
  return props.menuField.map(item => {
    if (typeof item === 'string') {
      return {
        text: item,
        disabled: false
      }
    }
    return {
      ...item
    }
  })
})

// Автоматическое позиционирование
watch(() => props.position, async () => {
  if (!props.visible) return

  await nextTick()

  const menuRect = menuRef.value?.getBoundingClientRect()
  if (!menuRect) return

  const viewportHeight = document.documentElement.clientHeight
  const viewportWidth = document.documentElement.clientWidth

  let finalX = props.position.x + 5
  let finalY = props.position.y

  // Проверяем, помещается ли меню снизу
  const spaceBelow = viewportHeight - props.position.y
  const spaceAbove = props.position.y

  if (spaceBelow < menuRect.height && spaceAbove >= menuRect.height) {
    finalY = props.position.y - menuRect.height - 5
  } else if (spaceBelow < menuRect.height && spaceAbove < menuRect.height) {
    finalY = viewportHeight - menuRect.height - 10
  }

  // Проверяем, не выходит ли меню за правый край
  const spaceRight = viewportWidth - props.position.x
  if (spaceRight < menuRect.width) {
    finalX = props.position.x - menuRect.width - 5
  }

  if (finalX < 10) finalX = 10
  if (finalY < 10) finalY = 10

  menuStyle.value = {
    left: `${finalX}px`,
    top: `${finalY}px`
  }
}, { immediate: true })

const handleAction = (actionName: MenuField): void => {
  emit('action', actionName)
  emit('close')
}

const handleClickOutside = (event: MouseEvent): void => {
  if (props.visible && !(event.target as Element).closest('.table__context-menu')) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('contextmenu', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('contextmenu', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.table__context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 5px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  min-width: 180px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;

  .context-menu__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.1s;
    color: #1f2328;

    &:hover {
      background-color: #f6f8fa;
      color: #1f2328;
    }

    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: #f9f9f9;

      &:hover {
        background-color: #f9f9f9;
        color: #1f2328;
      }
    }
  }

  .context-menu__hint {
    font-size: 11px;
    color: #666;
    font-style: italic;
  }
}
</style>
