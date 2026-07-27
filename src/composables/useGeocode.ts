// Геокодирование адреса/города в координаты через бесплатный Nominatim (OpenStreetMap).
// Ключ API не нужен. Результаты кэшируются в localStorage, а запросы к серверу
// сериализуются с задержкой, чтобы соблюдать лимит Nominatim (не чаще ~1 запроса в секунду).

export interface LatLng {
  lat: number
  lng: number
}

// Габаритная рамка России (Калининград на западе → Чукотка на востоке,
// Дагестан на юге → Земля Франца-Иосифа на севере). Используется и для
// ограничения геокодера, и для рамки карты.
export const RUSSIA_BOUNDS = {
  minLat: 41.0,
  maxLat: 82.0,
  minLng: 19.4,
  maxLng: 180.0,
} as const

export function isInRussia(coords: LatLng): boolean {
  return (
    coords.lat >= RUSSIA_BOUNDS.minLat &&
    coords.lat <= RUSSIA_BOUNDS.maxLat &&
    coords.lng >= RUSSIA_BOUNDS.minLng &&
    coords.lng <= RUSSIA_BOUNDS.maxLng
  )
}

const CACHE_KEY = 'geocode-cache-v1'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const MIN_REQUEST_GAP_MS = 1100
// viewbox=<lng_left>,<lat_top>,<lng_right>,<lat_bottom>; bounded=1 — строго внутри рамки.
const RUSSIA_VIEWBOX = `${RUSSIA_BOUNDS.minLng},${RUSSIA_BOUNDS.maxLat},${RUSSIA_BOUNDS.maxLng},${RUSSIA_BOUNDS.minLat}`

type Cache = Record<string, LatLng | null>

function readCache(): Cache {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Cache) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage может быть переполнен/недоступен — просто игнорируем кэширование.
  }
}

const normalize = (query: string): string => query.trim().toLowerCase().replace(/\s+/g, ' ')

// Очередь запросов, чтобы не делать несколько обращений к Nominatim одновременно.
let lastRequestAt = 0
let chain: Promise<unknown> = Promise.resolve()

async function requestNominatim(params: Record<string, string>): Promise<LatLng | null> {
  const wait = Math.max(0, MIN_REQUEST_GAP_MS - (Date.now() - lastRequestAt))
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait))
  }
  lastRequestAt = Date.now()

  const search = new URLSearchParams({
    format: 'json',
    limit: '1',
    'accept-language': 'ru',
    countrycodes: 'ru',
    bounded: '1',
    viewbox: RUSSIA_VIEWBOX,
    ...params,
  })
  const url = `${NOMINATIM_URL}?${search.toString()}`

  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) return null

    const results = (await response.json()) as Array<{ lat: string; lon: string }>
    if (!Array.isArray(results) || results.length === 0) return null

    const { lat, lon } = results[0]!
    const parsed: LatLng = { lat: Number(lat), lng: Number(lon) }
    if (Number.isNaN(parsed.lat) || Number.isNaN(parsed.lng)) return null

    // Отбрасываем всё, что вне России (страховка поверх countrycodes/viewbox).
    if (!isInRussia(parsed)) return null

    return parsed
  } catch (error) {
    console.error('Ошибка геокодирования:', error)
    return null
  }
}

// Общая логика: кэш + очередь запросов (лимит частоты Nominatim).
function runQueued(cacheKey: string, params: Record<string, string>): Promise<LatLng | null> {
  const key = normalize(cacheKey)
  if (!key) return Promise.resolve(null)

  const cache = readCache()
  if (key in cache) {
    return Promise.resolve(cache[key] ?? null)
  }

  const run = chain.then(async () => {
    // Другой запрос из очереди мог уже закэшировать этот же ключ.
    const fresh = readCache()
    if (key in fresh) return fresh[key] ?? null

    const result = await requestNominatim(params)
    const updated = readCache()
    updated[key] = result
    writeCache(updated)
    return result
  })

  // Ошибка одного запроса не должна рвать общую цепочку.
  chain = run.catch(() => undefined)
  return run
}

export function useGeocode() {
  /**
   * Свободный поиск по строке (используется, когда указан точный адрес).
   * Кэширует результат (в т.ч. отрицательный) в localStorage.
   */
  const geocode = (query: string): Promise<LatLng | null> => runQueued(query, { q: query })

  /**
   * Структурированный поиск по городу — возвращает координаты ЦЕНТРА города.
   * Используется, когда у объявления нет точного адреса.
   */
  const geocodeCity = (city: string): Promise<LatLng | null> =>
    runQueued(`city:${city}`, { city, country: 'Россия' })

  return { geocode, geocodeCity }
}
