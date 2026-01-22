import { ref, computed } from 'vue'
import type { MenuField, Position } from "@/components/Table/ContextMenuTable.vue";
import type { Headers } from "@/views/TableView.vue";

export function useContextMenu (headers: Headers[]) {
  // Состояния для контекстного меню
  const menuStatus = ref<boolean>(false)
  const menuPosition = ref<Position>({ x: 0, y: 0 })
  const selectedRowData = ref<Headers | null>(null)
  const selectedRowIndex = ref<number | null>(null)
  const menuField = ref<MenuField[]>([])

  const hiddenColumns = ref<Set<Headers['key']>>(new Set()) // Храним скрытые колонки

  const menuFieldsHeader = computed<MenuField[]>(() => {
    const visibleColumnsCount = headers.filter(header =>
      !hiddenColumns.value.has(header.key)
    ).length

    return [
      ...headers.map(header => {
        const isHidden = hiddenColumns.value.has(header.key)
        const isLastVisible = !isHidden && visibleColumnsCount === 1

        let icon = isHidden ? '➕' : '➖'
        if (isLastVisible) icon = '🚫'

        return {
          text: `${icon} ${header.text}`,
          disabled: isLastVisible,
          headerKey: header.key,
          isHidden,
          isLastVisible
        }
      }),
      {
        text: '📋 Показать все',
        disabled: false,
        headerKey: null,
        isHidden: false,
        isLastVisible: false
      }
    ]
  })

  // Функция проверки скрыта ли колонка
  const isColumnHidden = (columnKey: Headers['key']): boolean => {
    return hiddenColumns.value.has(columnKey)
  }

  function openContextMenu (row: Headers, rowIndex: number, event: MouseEvent, menuFieldName: MenuField[]) {
    menuField.value = menuFieldName
    selectedRowData.value = row
    selectedRowIndex.value = rowIndex
    menuPosition.value = {
      x: event.clientX,
      y: event.clientY
    }
    menuStatus.value = true
  }

  function closeContextMenu () {
    menuStatus.value = false
    selectedRowData.value = null
    selectedRowIndex.value = null
  }

  function handleMenuAction (actionItem: MenuField) {
    // Проверяем специальные команды
    if (actionItem.text === '📋 Показать все') {
      showAllColumns()
      return
    }

    // Проверяем, не отключен ли пункт меню
    if (actionItem.disabled) {
      console.log('Этот пункт меню отключен (последняя видимая колонка):', actionItem.text)
      return
    }

    // Обработка кликов по заголовкам
    const columnKey = actionItem.headerKey

    if (actionItem.isHidden && columnKey) {
      showColumn(columnKey)
    } else if (columnKey) {
      hideColumn(columnKey)
    }
  }

  function hideColumn (columnKey: string) {
    hiddenColumns.value.add(columnKey)
  }

  function showColumn (columnKey: string) {
    hiddenColumns.value.delete(columnKey)
  }

  function showAllColumns () {
    hiddenColumns.value.clear()
  }

  return {
    menuStatus,
    menuField,
    menuPosition,
    hiddenColumns,

    menuFieldsHeader,

    openContextMenu,
    closeContextMenu,
    handleMenuAction,
    isColumnHidden
  }
}
