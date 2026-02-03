<template>
  <header class="header">
    <router-link :to="{name: 'main'}" class="header__brand">
      <span class="header__title">Автоподборщик.ru</span>
    </router-link>
    <nav class="header__nav">
      <router-link
        :to="{name: 'main'}"
        class="header__link"
        :class="{ 'header__link--active': $route.name === 'main' }"
      >
        <div class="header__href">
          <HomeIcon color="#024760" />
          <span>Главная</span>
        </div>
      </router-link>

      <router-link
        :to="{ name: 'favorites' }"
        class="header__link"
        :class="{ 'header__link--active': $route.name === 'favorites' }"
      >
        <div class="header__href">
          <HeartIcon color="#c30303" size="24" />
          <span>Избранное ({{ favoritesStore.favoritesCount }})</span>
        </div>
      </router-link>

      <router-link
        :to="{ name: 'credit' }"
        class="header__link"
        :class="{ 'header__link--active': $route.name === 'credit' }"
      >
        <div class="header__href">
          <CreditIcon />
          <span>Автокредит</span>
        </div>
      </router-link>

      <router-link :to="{name: 'createAd'}" class="header__link header__link--form">Выложить объявление</router-link>
    </nav>
  </header>
  <div class="app" id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFavoritesStore } from "@/stores/favoritesStore"
import HomeIcon from "@/components/SvgIcons/HomeIcon.vue"
import HeartIcon from "@/components/SvgIcons/HeartIcon.vue"
import CreditIcon from "@/components/SvgIcons/CreditIcon.vue"

const favoritesStore = useFavoritesStore()

onMounted(() => {
  favoritesStore.loadFromLocalStorage()
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
  //background-color: #a1b5d6;
  background-color: #a5bfd5;
  &__title {
    color: #024760;
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
  }
  &__link {
   text-decoration: none;
   color: black;
   background-color: #f0f0f1;
   font-weight: 500;
   padding: 7px 10px;
   border-radius: 8px;
   transition: all 0.3s ease;
   position: relative;
    &:hover {
      opacity: 0.7;
      transition-duration: 0.2s;
    }
    &--form {
      padding: 9px 11px !important;
      margin-right: 0;
      //background-color: #3ab151;
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
    background: #5296bc !important;
    cursor: default;
    outline: none;
  }
}
</style>
