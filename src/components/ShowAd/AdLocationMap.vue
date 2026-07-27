<template>
  <section v-if="hasLocation" class="ad-map">
    <h3 class="ad-map__title">
      <MapPin :size="20" class="ad-map__title-icon" />
      Где находится автомобиль
    </h3>

    <p class="ad-map__subtitle">
      {{ locationLabel }}
      <span class="ad-map__hint">· синяя метка — этот автомобиль, светлые — другие объявления (наведите, чтобы увидеть фото)</span>
    </p>

    <div class="ad-map__stage">
      <div ref="mapEl" class="ad-map__canvas" />

      <button
        v-if="hasOtherMarkers"
        type="button"
        class="ad-map__toggle"
        @click="toggleOverview"
      >
        {{ overviewActive ? 'Вернуться к автомобилю' : 'Посмотреть другие варианты' }}
      </button>
    </div>

    <p v-if="isLocating" class="ad-map__status">Определяем расположение на карте…</p>
    <p v-else-if="unlocated" class="ad-map__status">Не удалось точно определить адрес на карте.</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from '@lucide/vue'
import { useAdvertisements, type Advertisement } from '@/composables/advertisements.ts'
import { useGeocode, isInRussia, RUSSIA_BOUNDS, type LatLng } from '@/composables/useGeocode.ts'
import { useAdvertisementOpen } from '@/composables/advertisementOpen.ts'
import { firstPhotoUrl } from '@/composables/adPhotos.ts'
import { useFormatters } from '@/composables/formatters.ts'

// Рамка карты ограничена Россией — вид нельзя увести в другие страны.
const RUSSIA_LAT_LNG_BOUNDS = L.latLngBounds(
  [RUSSIA_BOUNDS.minLat, RUSSIA_BOUNDS.minLng],
  [RUSSIA_BOUNDS.maxLat, RUSSIA_BOUNDS.maxLng],
)

// Первичный масштаб — приближение к метке, но так, чтобы было видно название города.
const INITIAL_ZOOM = 11
// Максимальный зум при показе всех вариантов (если они рядом, не приближаемся слишком).
const OVERVIEW_MAX_ZOOM = 13

// Стандартный стиль OSM: подписи берутся из поля `name` объекта, то есть
// на территории России они на русском («Москва», а не «Moscow»).
// Ретина-версии (@2x) этот сервер не отдаёт, а у CARTO, наоборот, подписи
// транслитерированы латиницей — русский язык здесь важнее плотности пикселей.
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

const props = defineProps<{
  ad: Advertisement | null
}>()

const { data: allAds } = useAdvertisements()
const { geocode, geocodeCity } = useGeocode()
const { openCard } = useAdvertisementOpen()
const { formatNumber } = useFormatters()

const mapEl = ref<HTMLElement | null>(null)
const isLocating = ref(false)
const unlocated = ref(false)
// Есть ли другие метки (для показа кнопки) и активен ли режим обзора всех вариантов.
const hasOtherMarkers = ref(false)
const overviewActive = ref(false)

let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
// Токен защищает от гонок: если объявление/список сменились во время геокодирования,
// устаревший билд маркеров прекращает работу.
let buildToken = 0
// Координаты текущего авто и рамка всех меток — для переключения «обзор ↔ авто».
let currentLatLng: L.LatLngExpression | null = null
let allBounds: L.LatLngExpression[] = []

const locationQuery = (ad: Advertisement | null): string =>
  [ad?.address, ad?.city].map((part) => part?.trim()).filter(Boolean).join(', ')

const hasLocation = computed((): boolean => locationQuery(props.ad).length > 0)

const locationLabel = computed((): string => locationQuery(props.ad))

// Координаты объявления: готовые из Firestore, либо геокодирование.
// При наличии точного адреса — поиск по адресу; если указан только город —
// координаты ЦЕНТРА города. Метки за пределами России не показываем.
async function resolveCoords(ad: Advertisement): Promise<LatLng | null> {
  if (typeof ad.lat === 'number' && typeof ad.lng === 'number') {
    const stored = { lat: ad.lat, lng: ad.lng }
    return isInRussia(stored) ? stored : null
  }

  const address = ad.address?.trim()
  const city = ad.city?.trim()

  if (address) {
    return geocode(city ? `${address}, ${city}` : address)
  }
  if (city) {
    return geocodeCity(city)
  }
  return null
}

function makeIcon(isCurrent: boolean): L.DivIcon {
  return L.divIcon({
    className: 'ad-pin-wrap',
    html: `<span class="ad-pin ${isCurrent ? 'ad-pin--current' : 'ad-pin--other'}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -22],
  })
}

const priceLabel = (ad: Advertisement): string =>
  ad.price ? `${formatNumber(ad.price) ?? ''} ₽` : ''

const carTitle = (ad: Advertisement): string => `${ad.brand} ${ad.model}`.trim()

// Узел с классом и текстом, сразу вложенный в родителя.
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  parent: HTMLElement,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  if (text) node.textContent = text
  parent.appendChild(node)
  return node
}

// Содержимое всплывающего окна собираем DOM-узлами, а не строкой HTML:
// так к кнопке вешается настоящий обработчик, а текст объявления попадает
// через textContent и не может сломать разметку.
function makePopupContent(ad: Advertisement, isCurrent: boolean): HTMLElement {
  const root = document.createElement('div')
  root.className = 'ad-popup'

  const photo = firstPhotoUrl(ad)
  if (photo) {
    const img = el('img', 'ad-popup__photo', root)
    img.src = photo
    img.alt = carTitle(ad)
    img.loading = 'lazy'
    // Если ссылка битая — убираем картинку, вместо «сломанного» превью.
    img.addEventListener('error', () => img.remove())
  }

  const body = el('div', 'ad-popup__body', root)
  el('strong', 'ad-popup__title', body, carTitle(ad))

  const price = priceLabel(ad)
  if (price) el('span', 'ad-popup__price', body, price)

  if (isCurrent) {
    el('span', 'ad-popup__badge', body, 'Вы смотрите это объявление')
    return root
  }

  const button = el('button', 'ad-popup__btn', body, 'Открыть объявление')
  button.type = 'button'
  L.DomEvent.on(button, 'click', (event) => {
    // Гасим событие, иначе Leaflet обработает его как клик по карте/метке.
    L.DomEvent.stop(event)
    openCard(ad)
  })

  return root
}

// Превью держим открытым, пока курсор на метке ИЛИ на самом окне: закрытие
// отложено, и переход курсора с метки на кнопку «Открыть объявление» его
// отменяет. Одна и та же механика для всех меток.
let popupCloseTimer: ReturnType<typeof setTimeout> | null = null
const wiredPopups = new WeakSet<HTMLElement>()

function cancelPopupClose(): void {
  if (popupCloseTimer) {
    clearTimeout(popupCloseTimer)
    popupCloseTimer = null
  }
}

function bindHoverPopup(marker: L.Marker): void {
  const scheduleClose = (): void => {
    cancelPopupClose()
    popupCloseTimer = setTimeout(() => {
      popupCloseTimer = null
      marker.closePopup()
    }, 200)
  }

  marker.on('mouseover', () => {
    cancelPopupClose()
    marker.openPopup()
  })
  marker.on('mouseout', scheduleClose)
  marker.on('popupopen', (event: L.PopupEvent) => {
    // Контейнер попапа Leaflet переиспользует между открытиями, поэтому
    // слушатели вешаются один раз — иначе они копятся с каждым наведением.
    const container = event.popup.getElement()
    if (!container || wiredPopups.has(container)) return
    wiredPopups.add(container)
    L.DomEvent.on(container, 'mouseenter', cancelPopupClose)
    L.DomEvent.on(container, 'mouseleave', scheduleClose)
  })
}

function addMarker(ad: Advertisement, coords: LatLng, isCurrent: boolean): void {
  if (!markersLayer) return

  const marker = L.marker([coords.lat, coords.lng], {
    icon: makeIcon(isCurrent),
    zIndexOffset: isCurrent ? 1000 : 0,
    title: carTitle(ad),
  })

  marker.bindPopup(() => makePopupContent(ad, isCurrent), {
    className: 'ad-map-popup',
    closeButton: false,
    autoPan: false,
    offset: [0, -18],
    minWidth: 168,
    maxWidth: 168,
  })

  bindHoverPopup(marker)

  // Клик по самой метке тоже открывает карточку — на тач-экранах наведения нет.
  if (!isCurrent) {
    marker.on('click', () => openCard(ad))
  }

  marker.addTo(markersLayer)
}

async function buildMarkers(): Promise<void> {
  if (!map || !markersLayer || !props.ad) return

  const token = ++buildToken
  isLocating.value = true
  unlocated.value = false
  overviewActive.value = false
  hasOtherMarkers.value = false
  markersLayer.clearLayers()
  allBounds = []
  currentLatLng = null

  const currentId = props.ad.id

  // 1) Сначала — текущее авто: ставим его метку и приближаем карту к ней
  // (город с названием). Так метка видна сразу, вид больше не «уезжает».
  const currentCoords = await resolveCoords(props.ad)
  if (token !== buildToken || !map || !markersLayer) return

  if (currentCoords) {
    addMarker(props.ad, currentCoords, true)
    currentLatLng = [currentCoords.lat, currentCoords.lng]
    allBounds.push(currentLatLng)
    map.invalidateSize()
    map.setView(currentLatLng, INITIAL_ZOOM)
  }
  unlocated.value = !currentCoords

  // 2) Затем — остальные объявления: добавляем метки по мере готовности
  // координат, вид при этом не двигаем (их можно показать кнопкой «другие варианты»).
  const others = allAds.value.filter((ad) => ad.id !== currentId)
  for (const ad of others) {
    const coords = await resolveCoords(ad)
    if (token !== buildToken || !map || !markersLayer) return // данные успели смениться
    if (coords) {
      addMarker(ad, coords, false)
      allBounds.push([coords.lat, coords.lng])
      hasOtherMarkers.value = true
    }
  }

  isLocating.value = false
}

// Показать масштаб, при котором видны другие варианты (подгон под все метки).
function showOverview(): void {
  if (!map || allBounds.length < 2) return
  map.fitBounds(allBounds as L.LatLngBoundsExpression, {
    padding: [40, 40],
    maxZoom: OVERVIEW_MAX_ZOOM,
  })
  overviewActive.value = true
}

// Вернуть приближение к текущему автомобилю.
function focusCurrent(): void {
  if (!map || !currentLatLng) return
  map.setView(currentLatLng, INITIAL_ZOOM)
  overviewActive.value = false
}

function toggleOverview(): void {
  if (overviewActive.value) focusCurrent()
  else showOverview()
}

function initMap(): void {
  if (!mapEl.value || map) return

  map = L.map(mapEl.value, {
    scrollWheelZoom: false,
    maxBounds: RUSSIA_LAT_LNG_BOUNDS,
    maxBoundsViscosity: 1.0,
    minZoom: 3,
    // zoomSnap оставляем целым (1): дробный зум масштабирует тайлы нецелым
    // коэффициентом и снова даёт мыло.
    zoomSnap: 1,
  }).setView([55.751244, 37.618423], 9)

  L.tileLayer(TILE_URL, {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  // Внутри анимации перехода страницы контейнер мог получить размер позже — пересчитываем.
  nextTick(() => map?.invalidateSize())
}

// Единая точка входа: гарантирует, что карта создана (если есть что показывать),
// и перестраивает метки. Вызывается и на маунте, и на изменениях данных —
// снапшот Firestore может прийти как до, так и после инициализации карты.
// Несколько источников (маунт + вотчеры) срабатывают почти одновременно, поэтому
// коалесцируем вызовы, чтобы одновременно шёл только один buildMarkers —
// иначе параллельные прогоны дублируют метки и перебивают друг другу fitBounds.
let buildTimer: ReturnType<typeof setTimeout> | null = null
function ensureMapAndBuild(): void {
  if (!hasLocation.value) return
  if (buildTimer) clearTimeout(buildTimer)
  buildTimer = setTimeout(() => {
    buildTimer = null
    if (!map) initMap()
    buildMarkers()
  }, 120)
}

onMounted(ensureMapAndBuild)

// Показываем карту, как только появились данные объявления.
watch(hasLocation, () => ensureMapAndBuild())

// Перестраиваем метки при смене текущего объявления или при подгрузке списка.
watch(() => props.ad?.id, () => ensureMapAndBuild())
watch(allAds, () => ensureMapAndBuild())

onBeforeUnmount(() => {
  buildToken++
  if (buildTimer) clearTimeout(buildTimer)
  cancelPopupClose()
  map?.remove()
  map = null
  markersLayer = null
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.ad-map {
  background: var(--surface);
  padding: 35px;
  border-radius: var(--border-radius-xlg);
  box-shadow: var(--shadow-lg);
  margin-top: 15px;

  &__title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0 0 var(--space-2) 0;
    color: var(--ink);
    font-size: 1.6rem;
    font-weight: 600;

    &-icon {
      color: var(--primary);
      flex-shrink: 0;
    }
  }

  &__subtitle {
    margin: 0 0 var(--space-5) 0;
    color: var(--ink-muted);
    font-size: var(--text-sm);
  }

  &__hint {
    color: var(--ink-faint);
  }

  &__stage {
    position: relative;
  }

  &__canvas {
    height: 380px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface-2);
    z-index: 0;
  }

  // Кнопка поверх карты (панель управления Leaflet имеет z-index ~1000).
  &__toggle {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    z-index: 1000;
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease),
      background-color var(--dur) var(--ease);

    &:hover {
      color: var(--primary);
      border-color: var(--primary);
      background: var(--primary-soft);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }

  &__status {
    margin: var(--space-3) 0 0 0;
    color: var(--ink-muted);
    font-size: var(--text-sm);
  }
}

@include mobile {
  .ad-map {
    padding: 25px;

    &__canvas {
      height: 280px;
    }
  }
}
</style>

<!-- Метки и подписи Leaflet рендерятся вне scope компонента, поэтому стилизуем их глобально. -->
<style lang="scss">
@use '@/assets/scss/mixins' as *;

.ad-pin {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 2px solid var(--surface);
  box-shadow: var(--shadow-md);
  cursor: pointer;

  &--current {
    background: var(--primary);
  }

  &--other {
    background: var(--accent, #38bdf8);
    cursor: pointer;
  }
}

// Превью объявления при наведении на метку: фото + название + кнопка перехода.
.ad-map-popup {
  .leaflet-popup-content-wrapper {
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    color: var(--ink);
    box-shadow: var(--shadow-lg);
  }

  // Отступы Leaflet обнуляем, чтобы фото шло от края до края.
  .leaflet-popup-content {
    margin: 0;
    line-height: 1.35;
  }

  .leaflet-popup-tip {
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: none;
  }
}

.ad-popup {
  &__photo {
    display: block;
    width: 100%;
    height: 86px;
    object-fit: cover;
    background: var(--surface-2);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-2);
  }

  &__title {
    color: var(--ink);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  &__price {
    color: var(--primary);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  &__badge {
    color: var(--ink-faint);
    font-size: 11px;
  }

  &__btn {
    margin-top: var(--space-1);
    padding: 5px var(--space-2);
    border: 1px solid var(--primary);
    border-radius: var(--radius-pill);
    background: var(--primary);
    color: var(--on-primary);
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color var(--dur) var(--ease), border-color var(--dur) var(--ease);

    &:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
}

.leaflet-container {
  font-family: var(--font-sans);
  // Фон под тайлами, пока они грузятся.
  background: var(--surface-2);
}

// Тёмного набора тайлов у стандартного стиля OSM нет, поэтому инвертируем светлые:
// invert + hue-rotate возвращает воде/зелени близкие к исходным оттенки, а тёмные
// подписи становятся светлыми на тёмном фоне (прежний brightness() лишь глушил
// картинку, оставляя серый текст на сером). Метки лежат в отдельной панели Leaflet
// и под фильтр не попадают.
:root[data-theme='dark'] .ad-map__canvas .leaflet-tile {
  filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.92) saturate(0.8);
}

// Органы управления Leaflet приводим к токенам, иначе белые кнопки бьют по глазам.
.ad-map__canvas {
  .leaflet-bar a {
    background: var(--surface);
    color: var(--ink);
    border-bottom-color: var(--border);

    &:hover {
      background: var(--surface-2);
      color: var(--primary);
    }
  }

  .leaflet-control-attribution {
    background: color-mix(in srgb, var(--surface) 85%, transparent);
    color: var(--ink-faint);

    a {
      color: var(--ink-muted);
    }
  }
}
</style>
