<template>
  <CardsAd
    :data="data"
    :loader="isLoading"
    @card-click="handleCardClick"
    @show-sold-auto="isOpenSoldAuto"
  />
</template>

<script setup lang="ts">
import CardsAd from '@/components/Cards/CardsAd.vue'
import { useAdvertisements } from '@/composables/useAdvertisements.ts'
import type { Advertisement } from "@/composables/useAdvertisements.ts";
import { computed, ref, provide } from 'vue'
import { useAdvertisementOpen } from "@/composables/useAdvertisementOpen"
import { useSoldAutoStore } from "@/stores/soldAutoStore.ts"

const soldAuto = useSoldAutoStore()

const toggleSoldAuto = ref(false)
provide('toggleSoldAuto', toggleSoldAuto)

const advertisements = useAdvertisements()
const { openCard } = useAdvertisementOpen()

const data = computed((): Advertisement[] => {
  if (!toggleSoldAuto.value) {
    if (soldAuto.getSoldCars.length > 0) {
      const idFromSold = soldAuto.getSoldCars.map(item => item.id)
      return advertisements.data.value.filter(item => !idFromSold.includes(item.id))
    }
    return advertisements.data.value
  } else {
    return soldAuto.getSoldCars
  }
})

const isLoading = computed((): boolean => advertisements.isLoading.value)

function isOpenSoldAuto (item: boolean) {
  toggleSoldAuto.value = item
}

const handleCardClick = (row: Advertisement): void => {
  openCard(row)
}
</script>
