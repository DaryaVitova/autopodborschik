export const useHighlightText = (text: string, searchValue: string): string => {
  if (!text || !searchValue) return text

  const searchTerm = searchValue.toLowerCase().trim()
  const regex = new RegExp(`(${searchTerm})`, 'gi')

  return String(text).replace(regex, '<span class="highlight">$1</span>')
}
