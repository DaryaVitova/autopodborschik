<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    :style="{
      fill: color,
      width: size + 'px',
      height: size + 'px'
    }"
  >
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  color?: string,
  size?: string | number
}>(), {
  color: 'currentColor',
  size: 30
})
</script>
