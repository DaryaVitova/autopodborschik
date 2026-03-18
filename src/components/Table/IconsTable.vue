<template>
  <img
    v-if="sortable"
    :src="sortableIcon"
    alt="sortable"
    class="table__sortable-icon"
    @click="toggleSort"
  />
  <img
    v-if="filter"
    :src="filterIcon"
    alt="filter"
    class="table__sortable-icon"
    @click="toggleVisibleFilter"
  />
</template>

<script setup lang="ts">
import sortableIcon from '@/assets/icons/sortableIcon.svg'
import filterIcon from '@/assets/icons/filterIcon.svg'
import { ref } from 'vue'

const props = defineProps<{
  sortable?: boolean,
  filter?: boolean | undefined,
  headerKey: string,
}>()

const emit = defineEmits<{
  (e: 'toggle-sort'): void,
  (e: 'toggle-visible-filter', payload: { headerKey: string }): void,
}>()

const openInput = ref(false)

function toggleSort (): void {
  emit('toggle-sort')
}

function toggleVisibleFilter (): void {
  openInput.value = !openInput.value
  emit('toggle-visible-filter', {
    headerKey: props.headerKey
  })
}

</script>

<style lang="scss" scoped>
.table {
  &__sortable-icon {
    padding: 5px 2.5px 5px 5px;
    margin-left: 10px;
    &:hover {
      opacity: 0.6;
      cursor: pointer;
    }
  }
}

@media(max-width: 747px) {
  .table {
    &__sortable-icon {
      margin-left: 5px;
    }
  }
}

</style>
