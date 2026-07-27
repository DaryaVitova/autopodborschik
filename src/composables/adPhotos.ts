import type { Advertisement } from '@/composables/advertisements.ts'

// В Firestore от старых записей попадаются пустые строки и строки вида
// 'null'/'undefined' — до показа такие ссылки нужно отсеивать.
const isUsablePhoto = (url: unknown): url is string =>
  typeof url === 'string' &&
  url.trim() !== '' &&
  !url.includes('null') &&
  !url.includes('undefined')

export function validPhotoUrls(ad: Advertisement | null | undefined): string[] {
  const photos = ad?.photoUrls
  return Array.isArray(photos) ? photos.filter(isUsablePhoto) : []
}

export function firstPhotoUrl(ad: Advertisement | null | undefined): string | null {
  return validPhotoUrls(ad)[0] ?? null
}
