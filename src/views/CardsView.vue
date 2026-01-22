<template>
  <CardsAd
    :data="data"
    :loader="isLoading"
    @card-click="handleCardClick"
  />
</template>

<script setup lang="ts">
import CardsAd from '@/components/Cards/CardsAd.vue'
import { useAdvertisements } from '@/composables/useAdvertisements.ts'
import type { Advertisement } from "@/composables/useAdvertisements.ts";
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAdvertisementOpen } from "@/composables/useAdvertisementOpen"

const router = useRouter()
const advertisements = useAdvertisements()
const { openCard } = useAdvertisementOpen()

const data = computed((): Advertisement[] => advertisements.data.value)

const isLoading = computed((): boolean => advertisements.isLoading.value)

const handleCardClick = (row: Advertisement): void => {
  openCard(row)
}
</script>
