<template>
  <div class="showAd">
    <div class="showAd__sticky-container-btn">
      <button class="back-button-arrow" @click="goBack" />
    </div>
    <!-- Заголовок -->
    <div class="ad-header">
      <FavoriteButton
        v-if="adData && !isAdInSoldAuto"
        class="ad-header__heart-button"
        :item="adData"
      />

      <h2>{{ adData?.brand }} {{ adData?.model }}</h2>
      <div v-if="!isAdInSoldAuto" class="ad-header__price-container">
        <span class="ad-header__price">{{ (adData?.price ? adData.price.toLocaleString('ru-RU') : '') + ' ₽' }}</span>
        <button
          class="ad-header__carLoan-calculation"
          @click="goToCalcCredit(adData?.price ? adData?.price : 0)"
        >
          Рассчитать автокредит
          <arrow-icon class="ad-header__carLoan-calculation--arrow"/>
        </button>
      </div>

      <div v-else class="ad-header__sold-price">
        <span class="ad-header__price ad-header__price--cross-out">
          {{ (adData?.price ? adData.price.toLocaleString('ru-RU') : '') + ' ₽' }}
        </span>
        <span class="ad-header__price--sold-auto">
          Продано за {{ (adData?.soldPrice ? adData.soldPrice.toLocaleString('ru-RU') : '') + ' ₽' }}
        </span>
      </div>
    </div>

    <!-- Основной контент - два столбца -->
    <div class="ad-content">
      <!-- Левая колонка - информация -->
      <div class="ad-info">
        <h3 class="ad-info__title">Информация об автомобиле</h3>

        <div class="ad-info__grid">
          <div class="ad-info__item">
            <span class="ad-info__item-label">Марка:</span>
            <span class="ad-info__item-value">{{ adData?.brand }}</span>
          </div>
          <div class="ad-info__item">
            <span class="ad-info__item-label">Модель:</span>
            <span class="ad-info__item-value">{{ adData?.model }}</span>
          </div>
          <div class="ad-info__item">
            <span class="ad-info__item-label">Год выпуска:</span>
            <span class="ad-info__item-value">{{ adData?.year }}</span>
          </div>
          <div class="ad-info__item">
            <span class="ad-info__item-label">Пробег:</span>
            <span class="ad-info__item-value">{{ adData?.mileage?.toLocaleString('ru-RU') }} км</span>
          </div>
          <div class="ad-info__item">
            <span class="ad-info__item-label">Город:</span>
            <span class="ad-info__item-value">{{ adData?.city }}</span>
          </div>
          <div class="ad-info__item" v-if="adData?.phone">
            <span class="ad-info__item-label">Телефон:</span>
            <span class="ad-info__item-value ad-info__item-value--phone">{{ adData?.phone }}</span>
          </div>
          <div class="ad-info__item" v-if="adData?.createdAt">
            <span class="ad-info__item-label">Дата добавления:</span>
            <span class="ad-info__item-value">{{ adData?.createdAt }}</span>
          </div>
        </div>

        <!-- Контакты -->
        <div class="ad-contacts" v-if="adData?.phone">
          <h3 class="ad-contacts__title">Контакты</h3>
          <div class="ad-contacts__item">
            <span class="ad-contacts__label">Телефон:</span>
            <a :href="`tel:${cleanPhone}`" class="ad-contacts__phone">
              {{ adData?.phone }}
            </a>
          </div>
          <button @click="copyPhone" class="ad-contacts__copy-btn">
            📋 Скопировать номер
          </button>
        </div>
        <div v-if="showCopyMessage" class="showAd__copy-msg">Скопировано</div>
      </div>

      <!-- Правая колонка - фото (только на десктопе) -->
      <div class="ad-photos" v-if="hasPhotos">
        <h3 class="ad-photos__title">
          Фотографии
          <span class="ad-photos__count">({{ validPhotos.length }})</span>
        </h3>

        <div class="ad-photos__gallery">
          <div
            v-for="(photo, index) in validPhotos"
            :key="index"
            class="ad-photos__gallery-item"
            @click="openLightbox(index)"
          >
            <div class="ad-photos__gallery-frame">
              <img
                :src="photo"
                :alt="`${adData?.brand} ${adData?.model} - фото ${index + 1}`"
                class="ad-photos__gallery-img"
                loading="lazy"
              />
              <div class="ad-photos__gallery-overlay">
                <span class="ad-photos__gallery-number">Фото {{ index + 1 }}</span>
                <span class="ad-photos__gallery-zoom">🔍</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ad-photos__hint">
          <span class="ad-photos__hint-icon">💡</span>
          Нажмите на фото для увеличения
        </div>
      </div>

      <div v-if="!hasPhotos" class="ad-photos__no-photos">
        <div class="ad-photos__no-photos-icon">📷</div>
        <p class="ad-photos__no-photos-text">Фотографии отсутствуют</p>
      </div>
    </div>

    <!-- Фото для мобильных (под информацией) -->
    <div class="ad-mobile-photos" v-if="hasPhotos">
      <h3 class="ad-mobile-photos__title">
        Фотографии
        <span class="ad-mobile-photos__count">({{ validPhotos.length }})</span>
      </h3>

      <div class="ad-mobile-photos__gallery">
        <div
          v-for="(photo, index) in validPhotos"
          :key="index"
          class="ad-mobile-photos__gallery-item"
          @click="openLightbox(index)"
        >
          <img
            :src="photo"
            :alt="`${adData?.brand} ${adData?.model} - фото ${index + 1}`"
            class="ad-mobile-photos__gallery-img"
            loading="lazy"
          />
          <div class="ad-mobile-photos__gallery-number">Фото {{ index + 1 }}</div>
        </div>
      </div>
    </div>

    <!-- Лайтбокс -->
    <div v-if="lightboxActive" class="lightbox" @click="closeLightbox">
      <button class="lightbox__close" @click="closeLightbox">✕</button>
      <button
        class="lightbox__prev"
        @click.stop="prevPhoto"
      />

      <div class="lightbox__content">
        <img
          :src="validPhotos[currentPhotoIndex]"
          :alt="`Фото ${currentPhotoIndex + 1}`"
          class="lightbox__image"
        />
        <div class="lightbox__counter">
          {{ currentPhotoIndex + 1 }} / {{ validPhotos.length }}
        </div>
      </div>

      <button
        class="lightbox__next"
        @click.stop="nextPhoto"
      />
    </div>

    <div class="showAd__bottom-container">
      <div class="ad-desc" v-if="adData?.description">
        <h3 class="ad-desc__title">Описание:</h3>
        <span>{{ adData?.description }}</span>
      </div>

      <div class="showAd__buttons">
        <button
          v-if="!isAdInSoldAuto"
          class="showAd__btn showAd__btn--sold"
          @click="openLightboxForSold"
        >
          Машину продали
        </button>

        <button
          class="showAd__btn showAd__btn--delete"
          @click="deleteAd(adData?.id)"
        >
          Удалить объявление
        </button>
      </div>
    </div>

    <div v-if="lightboxActiveForSold" class="lightbox lightbox--for-sold">
      <button class="lightbox__close" @click="closeLightboxForSold">✕</button>
      <div class="lightbox__input-group">
        <label for="priceSoldAuto" class="lightbox__label">Введите,  за сколько был куплен проданный автомобиль</label>

        <span
          v-if="errorInputPriceSoldData"
          class="lightbox__input--error-message"
        >
          * Заполните это поле
        </span>
        <input
          v-model="formattedPrice"
          @keydown="keyDownEvent"
          id="priceSoldAuto"
          class="lightbox__input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
        />
        <button
          class="showAd__btn showAd__btn--sold lightbox__input-group-btn"
          @click="addInSoldAuto"
        >
          Добавить автомобиль в проданные
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, type Ref } from 'vue'
import { useRouter } from "vue-router"
import type { Advertisement } from "@/composables/advertisements.ts"
import ArrowIcon from "@/components/SvgIcons/ArrowIcon.vue"
import { useFavoritesStore } from "@/stores/favoritesStore.ts"
import { useFormatters } from "@/composables/formatters.ts"
import { useSoldAutoStore } from "@/stores/soldAutoStore.ts"
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase.ts'

const router = useRouter()

const favoritesStore = useFavoritesStore()

const soldAuto = useSoldAutoStore()

const { formatNumber, parseNumber, allowOnlyNumbers } = useFormatters()

const adData: Ref<Advertisement | null> = ref(null)
const lightboxActive = ref(false)
const currentPhotoIndex = ref(0)

const lightboxActiveForSold = ref<boolean>(false)

const priceSoldAuto = ref<number | null>(null)
const errorInputPriceSoldData = ref<boolean>(false)

const isAdInSoldAuto = ref(false)

const showCopyMessage = ref(false)

const validPhotos = computed((): string[] => {
  if (!adData.value?.photoUrls || !Array.isArray(adData.value.photoUrls)) {
    return []
  }

  return adData.value.photoUrls.filter(photo =>
    photo &&
    photo.trim() !== '' &&
    !photo.includes('null') &&
    !photo.includes('undefined')
  )
})

const hasPhotos = computed((): boolean => {
  return validPhotos.value.length > 0
})

const cleanPhone = computed((): string => {
  if (!adData.value?.phone) return ''
  return adData.value.phone.replace(/[^\d+]/g, '')
})

const formattedPrice = computed({
  get: () => formatNumber(priceSoldAuto.value) || '',

  set: (newValue: string) => {
    if (errorInputPriceSoldData.value) {
      errorInputPriceSoldData.value = false
    }
    priceSoldAuto.value = parseNumber(newValue)
  }
})

function goToCalcCredit(price: number) {
  if (price !== 0) {
    router.push({
      name: 'credit',
      params: {
        exposePrice: price.toString()
      }
    })
  }
}

// Функции лайтбокса
const openLightbox = (index: number): void => {
  currentPhotoIndex.value = index
  lightboxActive.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = (): void => {
  lightboxActive.value = false
  document.body.style.overflow = 'auto'
}

const nextPhoto = (): void => {
  currentPhotoIndex.value = (currentPhotoIndex.value + 1) % validPhotos.value.length
}

const prevPhoto = (): void => {
  currentPhotoIndex.value = (currentPhotoIndex.value - 1 + validPhotos.value.length) % validPhotos.value.length
}

const copyPhone = async (): Promise<void> => {
  if (!adData.value?.phone) return

  try {
    await navigator.clipboard.writeText(cleanPhone.value)
      .then(() => {
        showCopyMessage.value = true
        setTimeout(() => {
          showCopyMessage.value = false
        }, 2000)
      })
  } catch (error) {
    console.error('❌ Ошибка копирования:', error)
  }
}

function goBack (): void {
  router.go(-1)
}

function keyDownEvent(event: KeyboardEvent): void {
  allowOnlyNumbers(event)
}

function openLightboxForSold (): void {
  lightboxActiveForSold.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightboxForSold () {
  lightboxActiveForSold.value = false
  priceSoldAuto.value = null
  document.body.style.overflow = 'auto'
}

function addInSoldAuto () {
  if (adData.value && priceSoldAuto.value) {
    soldAuto.addToSoldCars({...adData.value, soldPrice: priceSoldAuto.value })
    router.push({ name: 'cards' })
  } else if (!priceSoldAuto.value) {
    errorInputPriceSoldData.value = true
  }
}

const deleteAd = async (id: string | undefined): Promise<void> => {
  if (!confirm('Вы уверены, что хотите удалить это объявление?')) {
    return
  }

  try {
    const adRef = doc(db, 'advertisements', id)

    await deleteDoc(adRef)

    favoritesStore.removeFromFavorites(adRef.id)
    soldAuto.removeFromSoldAuto(adRef.id)
    router.go(-1)

  } catch (error) {
    console.error('Ошибка при удалении:', error)
    alert('Не удалось удалить объявление')
  }
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('advertisements')
    if (saved) {
      adData.value = JSON.parse(saved)

      const idFromSold = soldAuto.getSoldCars.map(item => item.id)
      if (adData.value && idFromSold.includes(adData.value.id)) {
       isAdInSoldAuto.value = true
      }
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error)
  }

  const handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && lightboxActive.value) {
      closeLightbox()
    }
    if (e.key === 'ArrowRight' && lightboxActive.value) {
      nextPhoto()
    }
    if (e.key === 'ArrowLeft' && lightboxActive.value) {
      prevPhoto()
    }
  }

  document.addEventListener('keydown', handleKeydown)

  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;
.showAd {
  position: relative;
  max-width: 1000px;
  margin: 0 auto 60px auto;
  padding: 40px 20px;
  background: #f8f9fa;
  min-height: 100vh;

  &__sticky-container-btn {
    position: sticky;
    top: 0;
    left: 0;
    height: 0;
    z-index: 1000;
  }

  &__bottom-container {
    display: flex;
    flex-direction: column;
  }

  &__buttons {
    display: flex;
    gap: 25px;
    align-self: flex-end;
    margin-top: 40px;
  }

  &__btn {
    border: none;
    border-radius: 7px;
    color: #fff;
    padding: 7px 15px;
    &:hover {
      opacity: 0.7;
      transition-duration: 0.5s;
    }
    &--delete {
      background-color: #bd3838;
    }
    &--sold {
      background-color: #6d5f8f;
    }
  }

  &__copy-msg {
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-size: 14px;
    background-color: #fff;
    padding: 4px 5px;
    border: 1px solid #b5b5b5;
    border-radius: 4px;
  }
}

/* Заголовок */
.ad-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  text-align: center;
  margin-bottom: 50px;
  padding: 35px;
  background: white;
  border-radius: var(--border-radius-xlg);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);

  &__carLoan-calculation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    padding: 6px;
    border: none;
    margin-top: 10px;
    background-color: transparent;
    border-radius: var(--border-radius-md);

    &:hover {
      cursor: pointer;
      transition-duration: 0.5s;
      background-color: #e3e3e3;
    }

    &--arrow {
      color: #1d771d;
    }
  }

  &__sold-price {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__price {
    font-size: 26px;
    &--cross-out {
      text-decoration: line-through;
    }
    &--sold-auto {
      font-size: 20px;
    }
  }

  &__heart-button {
    position: absolute;
    right: 12px;
    top: 8px;
  }
}

h2 {
  color: #333;
  margin: 20px 0 20px 0;
  font-size: 2.4rem;
  font-weight: 700;
}

.ad-subtitle {
  display: flex;
  justify-content: center;
  gap: 25px;
  flex-wrap: wrap;
}

.ad-subtitle span {
  padding: 10px 25px;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Основной контент - два столбца */
.ad-content {
  display: flex;
  gap: 40px;
  margin-bottom: 50px;
}

/* Левая колонка - информация */
.ad-info {
  flex: 1;
  background: white;
  padding: 35px;
  border-radius: var(--border-radius-xlg);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);

  &__title {
    color: #333;
    margin: 0 0 25px 0;
    font-size: 1.6rem;
    font-weight: 600;
    padding-bottom: 15px;
    border-bottom: 2px solid var(--color-middle-blue);
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 40px;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    align-items: flex-start;

    &:last-child {
      border-bottom: none;
    }

    &-label {
      color: #666;
      font-weight: 500;
      font-size: 16px;
      flex-shrink: 0;
      min-width: 160px;
    }

    &-value {
      color: #333;
      font-weight: 600;
      font-size: 16px;
      text-align: right;
      word-break: break-word;
      max-width: 400px;

      &--phone {
        color: var(--color-middle-blue);
        font-size: 1.1rem;
      }
    }
  }
}

.ad-desc {
  background: white;
  padding: 35px;
  border-radius: var(--border-radius-xlg);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  margin-top: 15px;
  &__title {
    margin-bottom: 15px;
  }
}

.value.description {
  font-style: italic;
  color: #555;
  text-align: left;
  line-height: 1.6;
  max-width: 500px;
}

/* Контакты */
.ad-contacts {
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;

  &__title {
    color: #333;
    margin: 0 0 20px 0;
    font-size: 1.6rem;
    font-weight: 600;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
  }

  &__label {
    color: #666;
    font-weight: 500;
    font-size: 16px;
  }

  &__phone {
    color: var(--color-middle-blue);
    font-size: 1.3rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
    &:hover {
      color: #45576a;
      text-decoration: underline;
    }
  }

  &__copy-btn {
    background: linear-gradient(135deg, var(--color-middle-blue), #45576a);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: var(--border-radius-lg);
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 15px rgba(82, 150, 188, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(82, 150, 188, 0.4);
    }
  }
}

/* Правая колонка - фото (десктоп) */
.ad-photos {
  width: 480px;
  background: white;
  padding: 35px;
  border-radius: var(--border-radius-xlg);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 40px;
  align-self: flex-start;
  max-height: calc(100vh - 160px);
  overflow-y: auto;

  &__title {
    color: #333;
    margin: 0 0 25px 0;
    font-size: 1.6rem;
    font-weight: 600;
    padding-bottom: 15px;
    border-bottom: 2px solid var(--color-middle-blue);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__count {
    color: var(--color-middle-blue);
    font-size: 1.2rem;
    font-weight: 500;
  }

  &__gallery {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    &-item:hover &-img {
      transform: scale(1.05);
    }

    &-item {
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f8f8;
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
      }
    }

    &-frame {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
    }

    &-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.3s ease;
    }

    &-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &-item:hover &-overlay {
      opacity: 1;
    }

    &-number {
      color: white;
      font-size: 13px;
      font-weight: 500;
    }

    &-zoom {
      color: white;
      font-size: 16px;
      opacity: 0.8;
    }
  }

  &__hint {
    margin-top: 25px;
    padding: 15px;
    background: #f0f8ff;
    border-radius: var(--border-radius-lg);
    color: var(--color-middle-blue);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid #d1e9ff;

    &-icon {
      font-size: 16px;
    }
  }

  &__no-photos {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: fit-content;
    text-align: center;
    padding: 40px 20px;
    background: #f9f9f9;
    border-radius: 12px;
    border: 2px dashed #ddd;

    &-icon {
      font-size: 70px;
      margin-bottom: 25px;
      opacity: 0.3;
    }

    &-text {
      color: #888;
      font-size: 20px;
      margin: 0;
    }
  }
}

/* Фото для мобильных (скрыты на десктопе) */
.ad-mobile-photos {
  display: none;
}

/* Лайтбокс */
.lightbox {
  @include lightbox;
  &--for-sold {
    background: rgba(177, 177, 177, 0.97);
  }

  &__input-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;

    &-btn {
      margin-top: 50px;
    }
  }

  &__label {
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 10px;
  }

  &__input {
    width: 50%;
    padding-left: 10px;

    &--error-message {
      font-size: 14px;
      color: #bf0606;
    }
  }

  &__close {
    position: absolute;
    top: 40px;
    right: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    font-size: 28px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  &__prev,
  &__next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.3s;

    display: grid;
    place-content: center;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    &::before {
      display: grid;
      place-content: center;
      width: 70px;
      height: 70px;
      padding-bottom: 7px;
      font-size: 34px;
    }
  }

  &__prev {
    left: 40px;
    &::before {
      content: "‹";
    }
  }

  &__next {
    right: 40px;
    &::before {
      content: "›";
      padding-left: 5px;
    }
  }

  &__content {
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__image {
    max-width: 100%;
    max-height: calc(90vh - 60px);
    object-fit: contain;
    border-radius: var(--border-radius-lg);
  }

  &__counter {
    color: white;
    margin-top: 25px;
    font-size: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px 25px;
    border-radius: 25px;
  }
}

@media (max-width: 1200px) {
  .showAd {
    max-width: 900px;
  }
  .ad-content {
    gap: 30px;
  }

  .ad-photos {
    width: 420px;
    &__gallery-frame {
      height: 160px;
    }
  }
}

@media (max-width: 1080px) {
  .showAd__sticky-container-btn {
    position: static;
  }

  .back-button-arrow {
    left: 0;
    top: -25px;
    position: relative;
    width: 40px;
    height: 40px;
    &::before {
      width: 14px;
      height: 14px;
    }
  }
  .ad-header {
    margin-top: 40px;
  }
}

@media (max-width: 992px) {
  .ad-content {
    flex-direction: column;
  }

  .ad-photos {
    display: none; /* Скрываем фото справа на планшетах */

    &__no-photos {
      padding: 30px;
    }
  }

  .ad-mobile-photos {
    display: block; /* Показываем фото под информацией */
    background: white;
    padding: 30px;
    border-radius: var(--border-radius-xlg);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    margin-top: 30px;

    &__title {
      color: #333;
      margin: 0 0 20px 0;
      font-size: 1.6rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &__count {
      color: var(--color-middle-blue);
      font-size: 1.2rem;
      font-weight: 500;
    }

    &__gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 15px;

      &-item {
        border-radius: var(--border-radius-lg);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;
        background: #f8f8f8;
        &:hover {
          transform: translateY(-3px);
        }
      }

      &-img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        object-position: center;
      }

      &-number {
        padding: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 12px;
        text-align: center;
      }
    }
  }
}

@media (max-width: 767px) {
  .showAd {
    padding: 20px 15px;
  }

  .ad-header {
    padding: 25px;
    margin-bottom: 30px;
  }

  h2 {
    font-size: 1.8rem;
  }

  .ad-subtitle {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .ad-subtitle span {
    width: 100%;
    max-width: 250px;
  }

  .ad-info {
    padding: 25px;
    &__item {
      flex-direction: column;
      gap: 5px;
      align-items: flex-start;

      &-label {
        min-width: auto;
      }

      &-value {
        text-align: left;
        max-width: 100%;
      }
    }
  }

  .ad-mobile-photos__gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));

    &-img {
      height: 130px;
    }
  }

  .lightbox {
    &__prev,
    &__next {
      width: 50px;
      height: 50px;
      font-size: 24px;
    }

    &__prev {
      left: 20px;
    }

    &__next {
      right: 20px;
    }

    &__close {
      top: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      font-size: 24px;
    }

    &__label {
      font-size: 14px;
      margin-inline: 15px;
      text-align: center;
    }
  }

  .showAd {
    &__btn {
      padding: 5px 10px;
      font-size: 12px;
    }
  }

  .back-button-arrow {
    top: -7px;
    width: 35px;
    height: 35px;
    &::before {
      width: 12px;
      height: 12px;
    }
  }
}

@media (max-width: 480px) {
  .ad-mobile-photos__gallery {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    &-img {
      height: 110px;
    }
  }

  .ad-contacts__copy-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
