<template>
  <div class="stepper" :style="{ '--progress': progress }">
    <div class="stepper__track" aria-hidden="true">
      <div class="stepper__fill" />
    </div>
    <ol class="stepper__list">
      <li
        v-for="(step, i) in steps"
        :key="step"
        class="stepper__item"
        :class="{
          'stepper__item--active': i + 1 === current,
          'stepper__item--done': i + 1 < current,
        }"
        :aria-current="i + 1 === current ? 'step' : undefined"
      >
        <span class="stepper__node">
          <Check v-if="i + 1 < current" :size="18" />
          <span v-else class="stepper__num mono">{{ i + 1 }}</span>
        </span>
        <span class="stepper__label">{{ step }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check } from '@lucide/vue'

const props = defineProps<{
  steps: string[]
  current: number
}>()

// 0 → 1 fraction of the track that should be filled.
const progress = computed(() => {
  if (props.steps.length <= 1) return 1
  const clamped = Math.min(Math.max(props.current, 1), props.steps.length)
  return (clamped - 1) / (props.steps.length - 1)
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.stepper {
  position: relative;
  width: 100%;

  &__track {
    position: absolute;
    top: 22px;
    left: 22px;
    right: 22px;
    height: 3px;
    background: var(--border);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  &__fill {
    height: 100%;
    width: calc(var(--progress) * 100%);
    background: linear-gradient(90deg, var(--primary), var(--accent));
    border-radius: var(--radius-pill);
    transition: width var(--dur-slow) var(--ease-out);
  }

  &__list {
    position: relative;
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    flex: 1;
    min-width: 0;
  }

  &__node {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--surface);
    border: 2px solid var(--border-strong);
    color: var(--ink-muted);
    transition: all var(--dur) var(--ease-spring);
  }
  &__num {
    font-size: var(--text-lg);
    font-weight: 700;
  }

  &__label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink-muted);
    text-align: center;
    white-space: nowrap;
    transition: color var(--dur) var(--ease);
  }

  // Active
  &__item--active &__node {
    border-color: var(--primary);
    color: var(--primary);
    box-shadow: 0 0 0 5px var(--primary-soft);
  }
  &__item--active &__label {
    color: var(--ink);
    font-weight: 600;
  }

  // Completed
  &__item--done &__node {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--on-primary);
  }
  &__item--done &__label {
    color: var(--ink);
  }

  @include tablet {
    &__track {
      top: 19px;
      left: 18px;
      right: 18px;
    }
    &__node {
      width: 38px;
      height: 38px;
    }
    &__label {
      font-size: var(--text-xs);
      white-space: normal;
      line-height: 1.2;
    }
  }

  @include mobile {
    &__track {
      top: 16px;
      left: 15px;
      right: 15px;
    }
    &__item {
      gap: var(--space-2);
    }
    &__node {
      width: 32px;
      height: 32px;
    }
    &__num {
      font-size: var(--text-base);
    }
    &__label {
      font-size: 10px;
    }
  }
}
</style>
