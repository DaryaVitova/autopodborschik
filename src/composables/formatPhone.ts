import { ref } from "vue"

export function useFormatPhone(
  selectedCountry: string,
) {
  const phone = ref<string>('')

  const phonePlaceholder = () => {
    if (selectedCountry === 'RU') {
      return 'XXX XXX-XX-XX'
    }
  }

  function formatPhoneNumber (e: InputEvent): void {
    if (!(e.target instanceof HTMLInputElement)) {
      console.error('Event target is not an input element')
      return
    }

    const target: HTMLInputElement = e.target

    console.log(target, 'target formatPhoneNumber')

    let input = target.value.replace(/[^0-9]/g, '')

    input = input.slice(0, 10)

    // Форматируем по шаблону XXX XXX-XX-XX
    let formatted = ''

    if (input.length > 0) {
      formatted = input.slice(0, 3)

      if (input.length > 3) {
        formatted += ' ' + input.slice(3, 6)
      }

      if (input.length > 6) {
        formatted += '-' + input.slice(6, 8)
      }

      if (input.length > 8) {
        formatted += '-' + input.slice(8)
      }
    }
    phone.value = formatted
  }

  return {
    phone,
    phonePlaceholder,
    formatPhoneNumber
  }
}
