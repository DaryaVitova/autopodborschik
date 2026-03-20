<template>
  <header class="header">
    <router-link :to="{name: 'main'}" class="header__brand">
      <span class="header__logo">Автоподборщик.ru</span>
    </router-link>
    <nav class="header__nav">
      <router-link
        :to="{name: 'main'}"
        class="header__link"
        :class="{ 'header__link--active': $route.name === 'main' }"
      >
        <div class="header__href">
          <HomeIcon color="#024760" :size="homeIconSize" />
          <span class="header__href--text">Главная</span>
        </div>
      </router-link>

      <router-link
        :to="{ name: 'favorites' }"
        class="header__link"
        :class="{ 'header__link--active': $route.name === 'favorites' }"
      >
        <div class="header__href">
          <HeartIcon color="#c30303" :size="heartIconSize" />
          <span class="header__href--text">Избранное ({{ favoritesStore.favoritesCount }})</span>
        </div>
      </router-link>

      <router-link
        :to="{ name: 'credit' }"
        class="header__link"
        :class="{ 'header__link--active': $route.name === 'credit' }"
      >
        <div class="header__href">
          <CreditIcon />
          <span class="header__href--text">Автокредит</span>
        </div>
      </router-link>

      <div class="header__create-ad-container">
        <router-link :to="{name: 'createAd'}" class="header__link header__link--form">Выложить объявление</router-link>
      </div>
    </nav>
  </header>
  <div class="app" id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useFavoritesStore } from "@/stores/favoritesStore"
import HomeIcon from "@/components/SvgIcons/HomeIcon.vue"
import HeartIcon from "@/components/SvgIcons/HeartIcon.vue"
import CreditIcon from "@/components/SvgIcons/CreditIcon.vue"

const favoritesStore = useFavoritesStore()

onMounted(() => {
  favoritesStore.loadFromLocalStorage()
  updateHomeIconSize()
  updateHeartIconSize() // начальный расчёт
  window.addEventListener('resize', updateHomeIconSize)
  window.addEventListener('resize', updateHeartIconSize)
})

const homeIconSize = ref(28)
const heartIconSize = ref(22)

const updateHomeIconSize = () => {
  const width = window.innerWidth
  if (width <= 767) {
    homeIconSize.value = 20
  } else if (width <= 1023) {
    homeIconSize.value = 22
  } else {
    homeIconSize.value = 28
  }
}

const updateHeartIconSize = () => {
  const width = window.innerWidth
  if (width <= 767) {
    heartIconSize.value = 16
  } else if (width <= 1023) {
    heartIconSize.value = 18
  } else {
    heartIconSize.value = 22
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', updateHomeIconSize)
  window.removeEventListener('resize', updateHeartIconSize)
})
</script>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.router-link-active {
  opacity: 0.8;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-light-blue);
  &__logo {
    color: var( --color-dark-blue);
    font-weight: bold;
    font-size: 22px;
    margin-left: 80px;
  }
  &__brand {
    text-decoration: none;
    cursor: pointer;
  }
  &__nav {
    display: flex;
    gap: 30px;
    padding-block: 20px;
    margin-right: 25px;
  }

  &__href {
    display: flex;
    align-items: center;
    gap: 5px;
    &--text {
      font-size: 15px;
      color: #272727;
    }
  }
  &__link {
   position: relative;
   text-decoration: none;
   color: black;
   background-color: #f0f0f1;
   font-weight: 500;
   padding: 5px 10px;
   border: 2px solid rgba(17, 69, 124, 0.5);
   border-radius: var(--border-radius-md);
   transition: all 0.3s ease;
    &:hover {
      opacity: 0.7;
      transition-duration: 0.2s;
    }
    &--form {
      padding: 9px 11px !important;
      margin-right: 0;
      background-color: #5d9a68;
      color: white;
      border: 1px solid #e1e0e0;
    }
  }
}

.menu-item {
  text-align: left;
  border: none;
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  background-color: #34495e;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
  text-decoration: none;
  &:hover {
    background: #45576a;
  }
  &--active {
    background: var(--color-middle-blue) !important;
    cursor: default;
    outline: none;
  }
}

@media (max-width: 1023px) {
  .header {
    &__nav {
      gap: 20px;
      margin-right: 15px;
    }
    &__logo {
      font-size: 18px;
      margin-left: 20px;
    }
    &__link {
      padding: 7px 8px;
      font-size: 14px;
      &--form {
        padding: 7px 9px !important;
      }
    }

    &__href--text {
      font-size: 14px;
    }
  }
}

@media (max-width: 767px) {
  .header {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 25px;

    &__nav {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-right: 0;
      justify-content: center;
      margin-top: 10px;
    }

    &__create-ad-container {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }

    &__logo {
      font-size: 20px;
    }

    &__link {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 6px !important;
      font-size: 10px;

      &--form {
        max-width: 250px;
        text-align: center;
        padding: 8px 15px !important;
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 400px) {
  .header {
    &__href--text {
      font-size: 10px;
    }
    &__link {
      padding: 5px 5px !important;
    }
  }
}
</style>
