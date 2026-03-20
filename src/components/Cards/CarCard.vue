<template>
  <div
    class="car-card"
    @click="clickCard"
    :class="{ 'car-card car-card__sold-overlay': isSoldAuto }"
  >
    <div v-if="isSoldAuto" class="car-card__price-sold-auto">Продано за {{ formatPrice(item?.soldPrice as number) }}</div>
    <!-- Фото автомобиля -->
    <div class="car-card__container">
      <div class="car-card__photo">
        <div v-if="currentPhotoUrl" class="car-card__photo-slider">
          <img
            :src="currentPhotoUrl"
            :alt="`${item?.brand} ${item?.model}`"
            loading="lazy"
            class="car-card__image"
          />

          <div v-if="photoCount > 1" class="car-card__photo-pagination">
              <span
                v-for="index in photoCount"
                :key="index"
                class="car-card__photo-dot"
                :class="{ 'car-card__photo-dot--active': currentPhotoIndex === index - 1 }"
                @click.stop="setCurrentPhoto(index - 1)"
              ></span>
          </div>

          <button
            v-if="photoCount > 1"
            class="car-card__photo-nav car-card__photo-nav--prev"
            @click.stop="prevPhoto"
          >
            ←
          </button>
          <button
            v-if="photoCount > 1"
            class="car-card__photo-nav car-card__photo-nav--next"
            @click.stop="nextPhoto"
          >
            →
          </button>
        </div>

        <div v-else class="car-card__no-photo">
          <span>📷</span>
          <p>Нет фото</p>
        </div>
        <div class="car-card__price">
          {{ formatPrice(item?.price) }} ₽
        </div>
      </div>

      <!-- Информация -->
      <div class="car-card__info">
        <h3 class="car-card__title">
          <span v-html="highlightText(item?.brand, highlightBrand)"></span>
          <span>{{ `&nbsp` }}</span>
          <span v-html="highlightText(item?.model, highlightModel)"></span>
        </h3>


        <div class="car-card__details">
          <div class="car-card__detail">
            <span class="car-card__detail-label">Год:</span>
            <span class="car-card__detail-value">{{ item?.year }}</span>
          </div>
          <div class="car-card__detail">
            <span class="car-card__detail-label">Пробег:</span>
            <span class="car-card__detail-value">{{ formatMileage(item?.mileage) }} км</span>
          </div>
          <div class="car-card__detail">
            <span class="car-card__detail-label">Город:</span>
            <span
              class="car-card__detail-value"
              v-html="highlightText(item?.city, highlightCity)"
            ></span>
          </div>
        </div>

        <!-- Дополнительная информация -->
        <div class="car-card__footer">
              <span class="car-card__date">
                {{ formatDate(item?.createdAt) }}
              </span>
          <span class="car-card__photos-count" v-if="item?.photoUrls?.length">
                📸 {{ item?.photoUrls.length }}
              </span>
        </div>
      </div>

      <FavoriteButton
        v-if="!isSoldAuto"
        class="car-card__heart-button"
        :item="item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, inject } from 'vue'
import type { Advertisement } from '@/composables/advertisements.ts'
// import FavoriteButton from '@/common/FavoriteButton.vue'
import {useRoute} from "vue-router";

const props = withDefaults(defineProps<{
  item: Advertisement,
  highlightBrand?: string,
  highlightModel?: string,
  highlightCity?: string
}>(), {
  highlightBrand: '',
  highlightModel: '',
  highlightCity: ''
})

const emit = defineEmits<{
  (e: 'card-click', item: Advertisement): void
}>()

const route = useRoute()

const isSoldAuto = inject('toggleSoldAuto')

const currentPhotoIndex = ref<number>(0)

const photoCount = computed((): number => {
  return props.item.photoUrls?.length || 0
})

const currentPhotoUrl = computed((): string | null => {
  return props.item?.photoUrls?.[currentPhotoIndex.value] || null
})

const setCurrentPhoto = (index: number): void => {
  currentPhotoIndex.value = index
}

const prevPhoto = (): void => {
  const maxIndex = (props.item.photoUrls?.length || 1) - 1
  currentPhotoIndex.value = currentPhotoIndex.value > 0
    ? currentPhotoIndex.value--
    : maxIndex
}

const nextPhoto = (): void => {
  if (currentPhotoIndex.value === (props.item?.photoUrls?.length - 1)) {
    currentPhotoIndex.value = 0
  } else {
    currentPhotoIndex.value++
  }
}

const highlightText = (text: string, searchValue: string): string => {
  if (!text || !searchValue) return text

  const searchTerm = searchValue.toLowerCase().trim()
  const regex = new RegExp(`(${searchTerm})`, 'gi')

  return String(text).replace(regex, '<span class="highlight">$1</span>')
}

const formatPrice = (price: number): string => {
  if (!price) return '—'
  return new Intl.NumberFormat('ru-RU').format(price)
}

const formatMileage = (mileage: number): string => {
  if (!mileage) return '—'
  return new Intl.NumberFormat('ru-RU').format(mileage)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const match = dateString.match(/(\d{2})\.(\d{2})\.(\d{4})/)

    if (match) {
      const [_, day, month, year] = match
      const date = new Date(Number(year), Number(month) - 1, Number(day))

      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    return dateString
  } catch {
    return dateString
  }
}

function clickCard(): void {
  // console.log(route.query, 'route.query clickCard')
  sessionStorage.setItem('cards-query', JSON.stringify(route.query))
  emit('card-click', props.item)
}
</script>

<style lang="scss" scoped>
.car-card {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &__sold-overlay::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(228, 228, 228, 0.5);
    z-index: 5;
    border-radius: 15px;
    pointer-events: none; /* Чтобы можно было кликать сквозь overlay */
  }

  &__container {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  &:hover .car-card__photo-nav {
    opacity: 1;
  }

  &__price-sold-auto {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    font-weight: 500;
    font-size: 20px;
    color: #22334a;
    z-index: 6;
  }

  &__heart-button {
    position: absolute;
    right: 12px;
    top: 8px;
  }

  &__photo {
    position: relative;
    width: 400px;
    height: 300px;
    background: #f8f9fa;
    overflow: hidden;
    border-radius: 15px 0 0 15px;


    @media (max-width: 480px) {
      height: 160px;
    }

    &-slider {
      position: relative;
      width: 100%;
      height: 100%;
    }

    &-pagination {
      position: absolute;
      bottom: 15px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 8px;
      z-index: 2;
    }

    &-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.8);
      }

      &--active {
        background-color: white;
        transform: scale(1.2);
      }
    }

    &-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-size: 18px;
      font-weight: bold;

      &:hover {
        background-color: rgba(44, 44, 44, 0.7);
      }

      &--prev {
        left: 10px;
      }

      &--next {
        right: 10px;
      }
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.3s ease;

    .car-card:hover & {
      transform: scale(1.05);
    }
  }

  &__no-photo {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9ca3af;

    span {
      font-size: 48px;
      margin-bottom: 10px;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  &__price {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(82, 150, 188, 0.95);
    color: white;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 16px;
  }

  &__info {
    padding: 20px 20px 20px 25px;
    width: 35%;
  }

  &__title {
    margin-bottom: 20px;
    font-size: 22px;
    font-weight: 600;
    color: #1f2937;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 15px;
  }

  &__detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__detail-label {
    color: #6b7280;
  }

  &__detail-value {
    color: #374151;
    font-weight: 500;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f3f4f6;
    font-size: 13px;
    color: #9ca3af;
  }

  &__photos-count {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

:deep(.highlight) {
  background-color: yellow;
  color: #333;
  padding: 2px 2px;
  border-radius: 4px;
  font-weight: 600;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #ff9800;
    border-radius: 2px;
  }
}

@media (max-width: 1023px) {
  .car-card {
    &__photo {
      width: 350px;
      min-height: 100%;
    }
  }
}

@media (max-width: 767px) {
  .car-card {
    &__title {
      font-size: 18px;
    }
    &__detail-label {
      font-size: 14px;
    }
    &__detail-value {
      font-size: 14px;
    }
    &__date {
      font-size: 12px;
    }
  }
}

@media (max-width: 660px) {
  .car-card {
    &__info {
      padding: 20px 15px 15px 20px;
      width: 45%;
    }
    &__title {
      margin-right: 10px;
      font-size: 15px;
    }
    &__photo {
      max-height: 250px;
      max-width: 250px;
    }

    &__container {
      height: 250px;
    }

    &__price {
      padding: 6px 12px;
      font-size: 14px;
    }
  }
}

@media (max-width: 600px) {
  .car-card {
    &__container {
      flex-direction: column;
      height: fit-content;
    }

    &__photo {
      max-width: 100%;
      height: 300px;
      border-radius: 15px 15px 0 0 ;
    }

    &__info {
      width: 100%;
    }

    &__heart-button {
      top: 265px;
    }

    &__title {
      width: 80%;
    }
  }
}
</style>
