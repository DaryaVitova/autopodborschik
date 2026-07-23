<template>
  <div v-if="favoritesStore.favoritesCount > 0" class="favorite">
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
    <p class="favorite__no-cards--text2">
      <span class="favorite__no-cards--text2-no-wrap">
        Посмотрите другие на Автоподборщик.ру — может быть,
      </span>
      <br>машина вашей мечты сейчас в продаже
    </p>
  </div>
</template>

<script setup lang="ts">
import { useFavoritesStore } from "@/stores/favoritesStore.ts"
import CarCard from "@/components/Cards/CarCard.vue";
import type { Advertisement } from "@/composables/advertisements.ts"
import { useAdvertisementOpen } from "@/composables/advertisementOpen.ts"

const favoritesStore = useFavoritesStore()
const { openCard } = useAdvertisementOpen()

const handleCardClick = (row: Advertisement): void => {
  openCard(row)
}

const clearFavorites = (): void => {
  favoritesStore.clearFavorites()
}
</script>

<style lang="scss" scoped>
.favorite {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: 100px;
  padding-inline: 20px;
  width: 100%;
  max-width: 800px;
  margin-bottom: 50px;
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
      color: var(--ink);
      font-weight: 700;
      white-space: nowrap;
    }
    &--text2 {
      text-align: center;
      &-no-wrap {
        white-space: nowrap;
      }
    }
  }

  &__clear-btn {
    align-self: flex-end;
    text-decoration: none;
    color: var(--primary);
    background-color: var(--surface);
    border: 1px solid var(--primary);
    font-weight: 600;
    padding: 8px 16px;
    border-radius: var(--radius-pill);
    margin-bottom: 80px;
    cursor: pointer;
    transition: background-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
      transform var(--dur-fast) var(--ease);

    &:hover {
      background-color: var(--primary-soft);
      box-shadow: var(--shadow-sm);
      transform: scale(1.02);
    }
  }
}


@media (max-width: 767px) {
  .favorite {
    margin-top: 70px;
    &__clear-btn {
      padding: 5px 7px;
      font-size: 12px;
    }
  }
}

@media (max-width: 600px) {
  .favorite {
    justify-content: center;
    width: 380px;

    &__no-cards {
      max-width: 70%;
      &--text1 {
        font-size: 18px;
      }
      &--text2 {
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 400px) {
  .favorite {
    width: 300px;
    &__no-cards {
      &--text2 {
        font-size: 11px;
      }
    }
  }
}
</style>
