<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
    :aria-pressed="theme === 'dark'"
    @click="toggle"
  >
    <Transition name="swap" mode="out-in">
      <Moon v-if="theme === 'dark'" key="moon" :size="16" />
      <Sun v-else key="sun" :size="16" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease),
    border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);

  &:hover {
    color: var(--primary);
    border-color: var(--primary);
    box-shadow: var(--shadow-sm);
  }
  &:focus-visible {
    @include focus-ring;
  }
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease-out);
}
.swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}
.swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
</style>
