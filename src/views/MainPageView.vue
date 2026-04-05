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
  margin-top: 100px;

  &__select-show {
    display: flex;
    gap: 20px;
    margin-top: 40px;
    align-items: center;

    &--link {
      text-decoration: none;
      font-size: 18px;
      color: #000d17;
      padding: 8px 16px;
      border-radius: var(--border-radius-sm);
      transition: all 0.3s ease;
      border: 2px solid var(--color-middle-blue);

      &:hover {
        background-color: #f0f8ff;
        opacity: 0.8;
      }

      &.active {
        background-color: var(--color-middle-blue);
        color: white;
        font-weight: 600;
      }
    }

    &--span {
      font-size: 18px;
      color: #4e4e4e;
    }
  }

  &__about-app-btn {
    position: absolute;
    right: 30px;
    top: 130px;
    border: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px;
    color: #113f60;
    &:hover {
      opacity: 0.8;
      transition-duration: 0.2s;
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
