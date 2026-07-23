<template>
  <header class="header">
    <div class="header__inner">
      <router-link :to="{ name: 'main' }" class="header__brand" aria-label="Автоподборщик.ru — на главную">
        <span class="header__mark" aria-hidden="true">
          <svg class="header__gauge" viewBox="0 0 32 32" fill="none">
            <path class="header__gauge-arc" d="M7.3 22 A10 10 0 1 1 24.7 22" />
            <g class="header__gauge-ticks">
              <line x1="7.34" y1="12" x2="9.5" y2="13.25" />
              <line x1="16" y1="7" x2="16" y2="9.5" />
              <line x1="24.66" y1="12" x2="22.5" y2="13.25" />
            </g>
          </svg>
        </span>
        <span class="header__logo">Автоподборщик<span class="header__logo-tld">.ru</span></span>
      </router-link>

      <nav class="header__nav" aria-label="Основная навигация">
        <router-link
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          class="header__link"
          :class="{ 'header__link--active': $route.name === link.name }"
        >
          <component :is="link.icon" :size="18" class="header__link-icon" />
          <span class="header__link-text">{{ link.label }}</span>
          <span v-if="link.badge" class="header__badge">{{ link.badge }}</span>
        </router-link>
      </nav>

      <div class="header__actions">
        <ThemeToggle />
        <router-link :to="{ name: 'createAd' }" class="header__cta">
          <Plus :size="18" :stroke-width="2.4" />
          <span>Выложить объявление</span>
        </router-link>
      </div>
    </div>
  </header>

  <main class="app" id="app">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, markRaw } from 'vue'
import { Home, Heart, Wallet, ShieldCheck, Plus } from '@lucide/vue'
import { useFavoritesStore } from '@/stores/favoritesStore'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const favoritesStore = useFavoritesStore()

onMounted(() => {
  favoritesStore.loadFromLocalStorage()
})

const links = computed(() => [
  { name: 'main', label: 'Главная', icon: markRaw(Home), badge: 0 },
  { name: 'favorites', label: 'Избранное', icon: markRaw(Heart), badge: favoritesStore.favoritesCount },
  { name: 'credit', label: 'Автокредит', icon: markRaw(Wallet), badge: 0 },
  { name: 'insurance', label: 'ОСАГО', icon: markRaw(ShieldCheck), badge: 0 },
])
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  backdrop-filter: saturate(1.4) blur(12px);
  border-bottom: 1px solid var(--border);

  &__inner {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-8);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    text-decoration: none;
    flex-shrink: 0;
  }
  &__mark {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background: linear-gradient(140deg, var(--primary), var(--primary-hover));
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-primary);
    overflow: hidden;
    transition: transform var(--dur) var(--ease-spring), box-shadow var(--dur) var(--ease);

    // Glossy sheen sweep that catches the eye on hover.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent 40%, rgba(255, 255, 255, 0.35) 50%, transparent 60%);
      transform: translateX(-120%);
      transition: transform var(--dur-slow) var(--ease);
    }
  }
  &__gauge {
    width: 30px;
    height: 30px;
  }
  &__gauge-arc {
    stroke: var(--on-primary);
    stroke-width: 2.2;
    stroke-linecap: round;
    opacity: 0.75;
  }
  &__gauge-ticks line {
    stroke: var(--on-primary);
    stroke-width: 1.4;
    stroke-linecap: round;
    opacity: 0.55;
  }

  &__logo {
    font-size: var(--text-xl);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  &__logo-tld {
    display: inline-block;
    margin-left: 4px;
    padding: 1px 6px;
    font-size: 0.58em;
    font-weight: 700;
    color: var(--on-primary);
    background: var(--primary);
    border-radius: var(--radius-sm);
    vertical-align: middle;
    transform: translateY(-1px);
  }

  // Brand hover: badge lifts, needle revs to full, sheen sweeps.
  &__brand:hover &__mark {
    transform: translateY(-1px) scale(1.05);
    box-shadow: var(--shadow-lg);
  }
  &__brand:hover &__mark::after {
    transform: translateX(120%);
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-left: auto;
  }
  &__link {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-pill);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink-muted);
    transition: color var(--dur) var(--ease), background-color var(--dur) var(--ease);

    &:hover {
      color: var(--ink);
      background: var(--surface-3);
    }
    &--active {
      color: var(--primary);
      background: var(--primary-soft);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
  &__link-icon {
    flex-shrink: 0;
  }
  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--on-primary);
    background: var(--primary);
    border-radius: var(--radius-pill);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }
  &__cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    height: 42px;
    padding: 0 var(--space-5);
    border-radius: var(--radius-pill);
    background: var(--primary);
    color: var(--on-primary);
    font-size: var(--text-sm);
    font-weight: 600;
    text-decoration: none;
    box-shadow: var(--shadow-primary);
    transition: background-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
      transform var(--dur-fast) var(--ease);

    &:hover {
      background: var(--primary-hover);
      box-shadow: var(--shadow-lg);
    }
    &:active {
      transform: translateY(1px);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
}

// Route transition
.page-enter-active,
.page-leave-active {
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease-out);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@include tablet {
  .header__inner {
    padding: var(--space-3) var(--space-4);
    gap: var(--space-4);
  }
  .header__link-text {
    display: none;
  }
  .header__link {
    padding: var(--space-2);
  }
  .header__cta span {
    display: none;
  }
  .header__cta {
    padding: 0;
    width: 42px;
    justify-content: center;
  }
}

@include mobile {
  .header__inner {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .header__nav {
    order: 3;
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
  }
  .header__link-text {
    display: inline;
    font-size: 10px;
  }
  .header__link {
    flex-direction: column;
    gap: 2px;
    padding: var(--space-2);
    flex: 1;
  }
  .header__logo {
    font-size: var(--text-lg);
  }
}
</style>
