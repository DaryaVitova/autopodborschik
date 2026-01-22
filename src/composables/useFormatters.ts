export function useFormatters() {

  const formatNumber = (value: string | null | number): string | undefined => {
    if (value === null || value === '') return ''
    if (typeof value === 'number' && !isNaN(value)) {
      return new Intl.NumberFormat('ru-RU').format(value)
    }
  }
// Преобразует строку с разделителями в число (100 000 → 100000)
  const parseNumber = (str: string): null | number => {
    if (!str) return null
    const cleaned = str.replace(/[^\d-]/g, '')
    return cleaned ? parseInt(cleaned, 10) : null
  }

  const allowOnlyNumbers = (event: KeyboardEvent): boolean => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ]

    if (event.ctrlKey || event.metaKey) {
      if (['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
        return true
      }
    }

    if (allowedKeys.includes(event.key)) {
      return true
    }

    if (/^\d$/.test(event.key)) {
      return true
    }

    event.preventDefault()
    return false
  }

  return {
    formatNumber,
    parseNumber,
    allowOnlyNumbers
  }
}
