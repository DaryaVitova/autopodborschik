<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    :fill="color"
  >
    <!-- Столбцы -->
    <rect x="4" y="8" width="3" height="12" fill="currentColor"/>
    <rect x="9" y="4" width="3" height="16" fill="currentColor"/>
    <rect x="14" y="6" width="3" height="14" fill="currentColor"/>
    <rect x="19" y="10" width="3" height="10" fill="currentColor"/>
    <!-- Ось X -->
    <path d="M2 20H22" stroke="currentColor" stroke-width="1"/>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: number,
  color?: string
}>(), {
  size: 28,
  color: 'currentColor'
})
</script>
