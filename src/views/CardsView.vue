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
import { useAdvertisementFilter } from "@/composables/useAdvertisementFilter.ts";

const soldAuto = useSoldAutoStore()

const toggleSoldAuto = ref(false)
provide('toggleSoldAuto', toggleSoldAuto)

const advertisements = useAdvertisements()
const { openCard } = useAdvertisementOpen()

const { data } = useAdvertisementFilter(advertisements, soldAuto, toggleSoldAuto)

const isLoading = computed((): boolean => advertisements.isLoading.value)

function isOpenSoldAuto (item: boolean) {
  toggleSoldAuto.value = item
}

const handleCardClick = (row: Advertisement, showSold: boolean): void => {
  openCard(row, showSold)
}
</script>
