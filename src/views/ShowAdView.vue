<template>
  <div class="showAd">
    <div class="sticky-container">
      <button class="back-button-arrow" @click="goBack"></button>
    </div>
    <!-- Заголовок -->
    <div class="ad-header">
      <h2>{{ adData?.brand }} {{ adData?.model }}</h2>
      <span class="ad-header__price">{{ (adData?.price ? adData.price.toLocaleString('ru-RU') : '') + ' ₽' }}</span>
    </div>

    <!-- Основной контент - два столбца -->
    <div class="ad-content">
      <!-- Левая колонка - информация -->
      <div class="ad-info">
        <h3 class="info-title">Информация об автомобиле</h3>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">Марка:</span>
            <span class="value">{{ adData?.brand }}</span>
          </div>
          <div class="info-item">
            <span class="label">Модель:</span>
            <span class="value">{{ adData?.model }}</span>
          </div>
          <div class="info-item">
            <span class="label">Год выпуска:</span>
            <span class="value">{{ adData?.year }}</span>
          </div>
          <div class="info-item">
            <span class="label">Пробег:</span>
            <span class="value">{{ adData?.mileage?.toLocaleString('ru-RU') }} км</span>
          </div>
          <div class="info-item">
            <span class="label">Город:</span>
            <span class="value">{{ adData?.city }}</span>
          </div>
          <div class="info-item" v-if="adData?.phone">
            <span class="label">Телефон:</span>
            <span class="value phone">{{ adData?.phone }}</span>
          </div>
          <div class="info-item" v-if="adData?.createdAt">
            <span class="label">Дата добавления:</span>
            <span class="value">{{ adData?.createdAt }}</span>
          </div>
        </div>

        <!-- Контакты -->
        <div class="contacts" v-if="adData?.phone">
          <h3 class="contacts-title">Контакты</h3>
          <div class="contact-item">
            <span class="contact-label">Телефон:</span>
            <a :href="`tel:${cleanPhone}`" class="contact-phone">
              {{ adData?.phone }}
            </a>
          </div>
          <button @click="copyPhone" class="copy-btn">
            📋 Скопировать номер
          </button>
        </div>
      </div>

      <!-- Правая колонка - фото (только на десктопе) -->
      <div class="ad-photos" v-if="hasPhotos">
        <h3 class="photos-title">
          Фотографии
          <span class="photos-count">({{ validPhotos.length }})</span>
        </h3>

        <div class="photos-gallery">
          <div
            v-for="(photo, index) in validPhotos"
            :key="index"
            class="photo-item"
            @click="openLightbox(index)"
          >
            <div class="photo-frame">
              <img
                :src="photo"
                :alt="`${adData?.brand} ${adData?.model} - фото ${index + 1}`"
                class="photo-img"
                loading="lazy"
              />
              <div class="photo-overlay">
                <span class="photo-number">Фото {{ index + 1 }}</span>
                <span class="photo-zoom">🔍</span>
              </div>
            </div>
          </div>
        </div>

        <div class="photos-hint">
          <span class="hint-icon">💡</span>
          Нажмите на фото для увеличения
        </div>
      </div>

      <div v-if="!hasPhotos" class="no-photos">
        <div class="no-photos-icon">📷</div>
        <p class="no-photos-text">Фотографии отсутствуют</p>
      </div>
    </div>

    <!-- Фото для мобильных (под информацией) -->
    <div class="mobile-photos" v-if="hasPhotos">
      <h3 class="mobile-photos-title">
        Фотографии
        <span class="mobile-photos-count">({{ validPhotos.length }})</span>
      </h3>

      <div class="mobile-photos-gallery">
        <div
          v-for="(photo, index) in validPhotos"
          :key="index"
          class="mobile-photo-item"
          @click="openLightbox(index)"
        >
          <img
            :src="photo"
            :alt="`${adData?.brand} ${adData?.model} - фото ${index + 1}`"
            class="mobile-photo-img"
            loading="lazy"
          />
          <div class="mobile-photo-number">Фото {{ index + 1 }}</div>
        </div>
      </div>
    </div>

    <!-- Лайтбокс -->
    <div v-if="lightboxActive" class="lightbox" @click="closeLightbox">
      <button class="lightbox-close" @click="closeLightbox">✕</button>
      <button class="lightbox-prev" @click.stop="prevPhoto">‹</button>

      <div class="lightbox-content">
        <img
          :src="validPhotos[currentPhotoIndex]"
          :alt="`Фото ${currentPhotoIndex + 1}`"
          class="lightbox-image"
        />
        <div class="lightbox-counter">
          {{ currentPhotoIndex + 1 }} / {{ validPhotos.length }}
        </div>
      </div>

      <button class="lightbox-next" @click.stop="nextPhoto">›</button>
    </div>

    <div class="ad-desc" v-if="adData?.description">
      <h3 class="ad-desc__title">Описание:</h3>
      <span>{{ adData?.description }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, type Ref} from 'vue'
import { useRouter } from "vue-router";
import type { Advertisement } from "@/composables/useAdvertisements"

const router = useRouter()

const adData: Ref<Advertisement | null> = ref(null)
const lightboxActive = ref(false)
const currentPhotoIndex = ref(0)

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
      .then(() => console.log('Copy is success'))
  } catch (error) {
    console.error('❌ Ошибка копирования:', error)
  }
}

function goBack(): void {
  router.go(-1)
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('advertisements')
    if (saved) {
      adData.value = JSON.parse(saved)
      console.log(adData.value, 'advertisements')
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error)
  }

  const handleKeydown = (e: KeyboardEvent): void => {
    console.log(e, 'e')
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

  return () => { // функция очистки - вызывается при размонтировании компонента
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style lang="scss" scoped>
.showAd {
  position: relative;
  max-width: 1000px;
  margin: 0 auto 60px auto;
  padding: 40px 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.back-button-arrow {
  position: absolute;
  top: 20px;
  left: -100px;
  width: 50px;
  height: 50px;
  background: #b3c9e1;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    border-left: 3px solid #333;
    border-bottom: 3px solid #333;
    transform: translate(-25%, -50%) rotate(45deg);
  }
  &:hover {
    background: #6a92bd;
    transform: translateX(-3px);
    transition-duration: 0.3s;
  }
}

.sticky-container {
  position: sticky;
  top: 0;
  left: 0;
  height: 0;
  z-index: 1000;
}

/* Заголовок */
.ad-header {
  text-align: center;
  margin-bottom: 50px;
  padding: 35px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  &__price {
    font-size: 26px;
  }
}

h2 {
  color: #333;
  margin: 0 0 20px 0;
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
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.ad-desc {
  background: white;
  padding: 35px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  margin-top: 50px;
  &__title {
    margin-bottom: 15px;
  }
}

.info-title {
  color: #333;
  margin: 0 0 25px 0;
  font-size: 1.6rem;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 2px solid #5296bc;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 40px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-start;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 500;
  font-size: 16px;
  flex-shrink: 0;
  min-width: 160px;
}

.value {
  color: #333;
  font-weight: 600;
  font-size: 16px;
  text-align: right;
  word-break: break-word;
  max-width: 400px;
}

.value.phone {
  color: #5296bc;
  font-size: 1.1rem;
}

.value.description {
  font-style: italic;
  color: #555;
  text-align: left;
  line-height: 1.6;
  max-width: 500px;
}

/* Контакты */
.contacts {
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.contacts-title {
  color: #333;
  margin: 0 0 20px 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.contact-label {
  color: #666;
  font-weight: 500;
  font-size: 16px;
}

.contact-phone {
  color: #5296bc;
  font-size: 1.3rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-phone:hover {
  color: #45576a;
  text-decoration: underline;
}

.copy-btn {
  background: linear-gradient(135deg, #5296bc, #45576a);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(82, 150, 188, 0.3);
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(82, 150, 188, 0.4);
}

/* Правая колонка - фото (десктоп) */
.ad-photos {
  width: 480px;
  background: white;
  padding: 35px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 40px;
  align-self: flex-start;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.photos-title {
  color: #333;
  margin: 0 0 25px 0;
  font-size: 1.6rem;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 2px solid #5296bc;
  display: flex;
  align-items: center;
  gap: 10px;
}

.no-photos{
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
}

.photos-count {
  color: #5296bc;
  font-size: 1.2rem;
  font-weight: 500;
}

.photos-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.photo-item {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f8f8;
}

.photo-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.photo-frame {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.photo-item:hover .photo-img {
  transform: scale(1.05);
}

.photo-overlay {
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

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-number {
  color: white;
  font-size: 13px;
  font-weight: 500;
}

.photo-zoom {
  color: white;
  font-size: 16px;
  opacity: 0.8;
}

.photos-hint {
  margin-top: 25px;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 10px;
  color: #5296bc;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d1e9ff;
}

.hint-icon {
  font-size: 16px;
}

/* Фото для мобильных (скрыты на десктопе) */
.mobile-photos {
  display: none;
}

///* Нет фото */
//.no-photos {
//  text-align: center;
//  padding: 60px;
//  background: white;
//  border-radius: 16px;
//  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
//}

.no-photos-icon {
  font-size: 70px;
  margin-bottom: 25px;
  opacity: 0.3;
}

.no-photos-text {
  color: #888;
  font-size: 20px;
  margin: 0;
}

/* Лайтбокс */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.lightbox-close {
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
  z-index: 1001;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-prev,
.lightbox-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 35px;
  cursor: pointer;
  transition: background 0.3s;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-prev:hover,
.lightbox-next:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-prev {
  left: 40px;
}

.lightbox-next {
  right: 40px;
}

.lightbox-content {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: calc(90vh - 60px);
  object-fit: contain;
  border-radius: 10px;
}

.lightbox-counter {
  color: white;
  margin-top: 25px;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 25px;
  border-radius: 25px;
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
  }

  .photo-frame {
    height: 160px;
  }
}

@media (max-width: 1080px) {
  .back-button-arrow {
    left: 0;
    top: -25px;
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
  }

  .no-photos {
    padding: 30px;
  }

  .mobile-photos {
    display: block; /* Показываем фото под информацией */
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    margin-top: 30px;
  }

  .mobile-photos-title {
    color: #333;
    margin: 0 0 20px 0;
    font-size: 1.6rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mobile-photos-count {
    color: #5296bc;
    font-size: 1.2rem;
    font-weight: 500;
  }

  .mobile-photos-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }

  .mobile-photo-item {
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;
    background: #f8f8f8;
  }

  .mobile-photo-item:hover {
    transform: translateY(-3px);
  }

  .mobile-photo-img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    object-position: center;
  }

  .mobile-photo-number {
    padding: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 12px;
    text-align: center;
  }
}

@media (max-width: 768px) {
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
  }

  .info-item {
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }

  .label {
    min-width: auto;
  }

  .value {
    text-align: left;
    max-width: 100%;
  }

  .mobile-photos-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .mobile-photo-img {
    height: 130px;
  }

  .lightbox-prev,
  .lightbox-next {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .lightbox-prev {
    left: 20px;
  }

  .lightbox-next {
    right: 20px;
  }

  .lightbox-close {
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 24px;
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
  .mobile-photos-gallery {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }

  .mobile-photo-img {
    height: 110px;
  }

  .copy-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
