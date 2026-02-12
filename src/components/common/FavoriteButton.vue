<template>
  <div
    class="heart-icon"
    :title="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
    @click.stop="toggleFavorite"
  >
    <HeartIcon
      :color="!isFavorite ? 'transparent' : '#c30303'"
      :border="isFavorite ? 'transparent' : '#6b7280'"
      :size="computedSize"
    />
  </div>
</template>

<script setup lang="ts">
import HeartIcon from '@/components/SvgIcons/HeartIcon.vue'
import { useFavoritesStore } from "@/stores/favoritesStore"
import type { Advertisement } from '@/composables/useAdvertisements'
import { computed } from "vue"

const props = defineProps<{
  item: Advertisement
}>()

const favoritesStore = useFavoritesStore()

const isFavorite = computed((): boolean => {
  return favoritesStore.isFavorite(props.item.id)
})

const computedSize = computed(() => {
  if (window.innerWidth < 768) {
    return 20
  }
  return 30
})

const toggleFavorite = (): void => {
  favoritesStore.toggleFavorite(props.item)
}
</script>

<style lang="scss" scoped>
.heart-icon {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  padding: 3px;
  &:hover {
    background-color: #ededed;
    border-radius: 5px;
    transition-duration: 0.2s;
  }
}

@media (max-width: 660px) {
  .heart-icon {
    margin-bottom: 5px;
    margin-left: 5px;
  }
}
</style>
