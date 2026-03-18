<template>
  <DynamicTable
    :headers="headersForTable"
    :data="data"
    :loader="isLoading"
    @row-click="handleRowClick"
    @show-sold-auto="isOpenSoldAuto"
  />
</template>

<script setup lang="ts">
import DynamicTable from '@/components/Table/DynamicTable.vue'
import { useAdvertisements } from '@/composables/advertisements.ts'
import { useRouter } from 'vue-router'
import {computed, ref} from 'vue'
import type { Advertisement, UseAdvertisementsReturn } from "@/composables/advertisements.ts";
import { useSoldAutoStore } from "@/stores/soldAutoStore.ts"
import { useAdvertisementFilter } from "@/composables/advertisementFilter.ts";

export interface Headers {
  key: string,
  text: string,
  sortable?: boolean,
  filter?: { search: boolean }
}

const headersForTable: Headers[] = [
  { key: 'brand', text: 'Марка', sortable: true, filter: { search: true } },
  { key: 'model', text: 'Модель', sortable: true, filter: { search: true } },
  { key: 'year', text: 'Год выпуска', sortable: true },
  { key: 'mileage', text: 'Пробег (км)', sortable: true },
  { key: 'city', text: 'Город', sortable: true, filter: { search: true } }
]

const router = useRouter()
const advertisements: UseAdvertisementsReturn = useAdvertisements()
const soldAuto = useSoldAutoStore()

const toggleSoldAutoInTable = ref(false)

const { data } = useAdvertisementFilter(advertisements, soldAuto, toggleSoldAutoInTable)

const isLoading = computed((): boolean => advertisements.isLoading.value)

const handleRowClick = (row: Advertisement): void => {
  localStorage.setItem('advertisements', JSON.stringify(row))
  router.push({
    name: 'showAd',
    params: { id: row.id },
    query: toggleSoldAutoInTable.value ? { showSold: 'true' } : {}
  })
}

function isOpenSoldAuto (item: boolean) {
  toggleSoldAutoInTable.value = item
}
</script>
