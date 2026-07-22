<template>
  <div class="main">
    <button
      v-if="!openAboutApp"
      class="main__about-app-btn"
      @click="openAboutAppBtn"
    >
      <arrow-icon :arrowLeft="true" />О приложении
    </button>

    <button
      v-if="openAboutApp"
      class="main__about-app-btn"
      @click="closeAboutAppBtn"
    >
      Закрыть<arrow-icon />
    </button>

    <Transition name="slide">
      <about-app v-if="openAboutApp" />
    </Transition>

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
import ArrowIcon from '@/components/SvgIcons/ArrowIcon.vue'
import AboutApp from "@/components/Main/AboutApp.vue"

const route = useRoute()
const router = useRouter()

const openAboutApp = ref(false)

function openAboutAppBtn() {
  openAboutApp.value = true
}

function closeAboutAppBtn() {
  openAboutApp.value = false
}

onMounted(() => {
  if (route.path === '/') {
    router.replace('/')
  }
})
</script>

<style lang="scss" scoped>
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

  &__about-app-btn {
    position: absolute;
    right: 30px;
    top: 90px;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    color: var(--primary);
    font-weight: 600;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: background-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
    &:hover {
      background: var(--primary-soft);
      box-shadow: var(--shadow-md);
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

@media (max-width: 768px) {
  .main__about-app-btn {
    top: 240px;
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

    &__about-app-btn {
      font-size: 14px;
    }
  }
}

@media (max-width: 400px) {
  .main__about-app-btn {
    top: 220px;
  }
}
</style>
