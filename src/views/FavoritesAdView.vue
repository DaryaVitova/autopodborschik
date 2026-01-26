<template>
  <div v-if="favoritesStore.favoritesCount > 0" class="favorite">
    <button class="back-button-arrow" @click="goBack" />
    <button class="favorite__clear-btn" @click="clearFavorites">Очистить избранное</button>
    <car-card
      v-for="item in favoritesStore.getFavorites"
      class="favorite__card"
      :key="item.id"
      :item="item"
      @card-click="handleCardClick"
    />
  </div>

  <div v-else class="favorite__no-cards">
    <h2 class="favorite__no-cards--text1">Нет избранных объявлений</h2>
    <p class="favorite__no-cards--text2">Посмотрите другие на Автоподборщик.ру — может быть,<br>машина вашей мечты сейчас в продаже</p>
  </div>
</template>

<script setup lang="ts">
import { useFavoritesStore } from "@/stores/favoritesStore.ts"
import CarCard from "@/components/Cards/CarCard.vue";
import type { Advertisement } from "@/composables/useAdvertisements.ts"
import { useAdvertisementOpen } from "@/composables/useAdvertisementOpen"
import { useRouter } from "vue-router"

const router = useRouter()

const favoritesStore = useFavoritesStore()
const { openCard } = useAdvertisementOpen()

const handleCardClick = (row: Advertisement): void => {
  openCard(row)
}

const clearFavorites = (): void => {
  favoritesStore.clearFavorites()
}

const goBack = (): void => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.favorite {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: 70px;
  width: 100%;
  max-width: 800px;
  margin-bottom: 30px;
  &__card {
    margin-bottom: 25px;
  }
  &__no-cards {
    max-width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-top: 200px;
    &--text1 {
      color: #024760;
    }
    &--text2 {
      text-align: center;
    }
  }

  &__clear-btn {
    align-self: flex-end;
    text-decoration: none;
    background-color: #fff;
    border: 2px solid #4b92af;
    font-weight: 500;
    padding: 7px 10px;
    border-radius: 8px;
    margin-bottom: 50px;

    &:hover {
      opacity: 0.7;
      transform: scale(1.02);
      transition-duration: 0.2s;
    }
  }
}
</style>
