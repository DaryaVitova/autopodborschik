<template>
  <div v-if="favoritesStore.favoritesCount > 0" class="favorite">
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
import {useFavoritesStore} from "@/stores/favoritesStore.ts"
import CarCard from "@/components/Cards/CarCard.vue";
import type { Advertisement } from "@/composables/useAdvertisements.ts"
import { useAdvertisementOpen } from "@/composables/useAdvertisementOpen"

const favoritesStore = useFavoritesStore()
const { openCard } = useAdvertisementOpen()

const handleCardClick = (row: Advertisement): void => {
  openCard(row)
}
</script>

<style lang="scss" scoped>
.favorite {
  margin-top: 60px;
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
}
</style>
