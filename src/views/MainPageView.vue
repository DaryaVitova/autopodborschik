<template>
  <div class="main">
    <!-- Both are teleported out of .main because they are viewport-anchored: the
         route transition animates a transform on .main, and a transformed
         ancestor becomes the containing block for fixed and absolutely
         positioned descendants alike. Left inside, the button visibly slid from
         .main's corner to the viewport corner on load, and neither could stay
         fixed while the listings scroll. -->
    <Teleport to="body">
      <button
        class="main__about-app-btn"
        :aria-label="openAboutApp ? 'Закрыть' : 'О приложении'"
        :title="openAboutApp ? 'Закрыть' : 'О приложении'"
        :aria-expanded="openAboutApp"
        @click="toggleAboutApp"
      >
        <X v-if="openAboutApp" :size="20" :stroke-width="2.4" />
        <span v-else aria-hidden="true">?</span>
      </button>

      <Transition name="slide">
        <about-app v-if="openAboutApp" />
      </Transition>
    </Teleport>

    <div class="main__select-show">
      <router-link
        to="/cards"
        class="main__select-show--link"
        :class="{ 'active': route.name === 'cards' }"
      >
        Карточки
      </router-link>

      <span class="main__select-show--span">|</span>

      <router-link
        to="/table"
        class="main__select-show--link"
        :class="{ 'active': route.name === 'table' }"
      >
        Таблица
      </router-link>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { X } from '@lucide/vue'
import AboutApp from "@/components/Main/AboutApp.vue"

const route = useRoute()
const router = useRouter()

const openAboutApp = ref(false)

function toggleAboutApp() {
  openAboutApp.value = !openAboutApp.value
}

onMounted(() => {
  if (route.path === '/') {
    router.replace('/')
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: var(--space-10);

  &__select-show {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-10);
    align-items: center;
    padding: 4px;
    background: var(--surface-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);

    &--link {
      text-decoration: none;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--ink-muted);
      padding: var(--space-2) var(--space-5);
      border-radius: var(--radius-pill);
      transition: color var(--dur) var(--ease), background-color var(--dur) var(--ease);

      &:hover {
        color: var(--ink);
      }

      &.active {
        background-color: var(--surface);
        color: var(--primary);
        box-shadow: var(--shadow-sm);
      }
    }

    &--span {
      display: none;
    }
  }

  // Round icon-only toggle: "?" to open the FAQ panel, "×" to close it.
  // Sits above the panel (which is z-index 10000) so the close state stays
  // reachable once the panel covers this corner.
  &__about-app-btn {
    // Fixed, so it stays reachable while the listings scroll. This only works
    // because the button is teleported to body — inside .main the route
    // transition's transform would become its containing block and it would
    // scroll away with the page.
    position: fixed;
    right: 30px;
    top: 90px;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    padding: 0;
    color: var(--primary);
    font-size: var(--text-xl);
    font-weight: 700;
    line-height: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: background-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
      transform var(--dur-fast) var(--ease);
    &:hover {
      background: var(--primary-soft);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

// The mobile header wraps onto two rows (~152px tall), so the toggle sits below
// it. Breakpoint matches the header's own @include mobile (767px) rather than
// 768px, where the header is still in its single-row tablet layout.
@media (max-width: 767px) {
  .main__about-app-btn {
    top: 168px;
    right: 20px;
  }
}

@media (max-width: 600px) {
  .main {
    margin-top: 70px;
    &__select-show {
      &--link {
        padding: 7px 14px;
        font-size: 15px;
      }
    }
  }
}
</style>
