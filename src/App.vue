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
        :to="{name: 'favorites'}"
        class="header__link"
        :class="{ 'header__link--active': $route.name === 'favorites' }"
      >
        <div class="header__href">
          <HeartIcon color="#c30303" />
          <span>Избранное</span>
        </div>
      </router-link>
      <router-link :to="{name: 'createAd'}" class="header__link header__link--form">Выложить объявление</router-link>
    </nav>
  </header>
  <div class="app" id="app">
    <div class="sidebar">
      <div class="sidebar-content">
        <h3 class="sidebar__title">Меню</h3>
        <a
          href="#"
          class="menu-item"
          :class="{ 'menu-item--active': isMainActive }"
          @click.prevent="goToMain"
        >
          Главная
        </a>
        <a
          href="#"
          class="menu-item"
          :class="{ 'menu-item--active': route.name === 'createAd' }"
          @click.prevent="goToCreatingAd"
        >
          Выложить объявление
        </a>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import HomeIcon from "@/components/SvgIcons/HomeIcon.vue"
import HeartIcon from "@/components/SvgIcons/HeartIcon.vue"

const route = useRoute()
const router = useRouter()

const isMainActive = computed((): boolean => {
  return route.name === 'table' || route.name === 'cards'
})

const goToMain = (): void => {
  if (route.name !== 'table') {
    router.push({ name: 'table' })
  }
}


const goToCreatingAd = (): void => {
  if (route.name !== 'createAd') {
    router.push({ name: 'createAd' })
  }
}
</script>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
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
    }
  }
}

.sidebar {
  position: fixed;
  z-index: 100;
  left: -250px;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: 400px;
  background: #2c3e50;
  color: white;
  transition: all 0.3s ease;
  border-radius: 0 10px 10px 0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.3);
  &__title {
    margin-bottom: 20px;
  }
  &:hover {
    left: 0;
  }
  &::before {
    content: '›';
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 60px;
    background: #2c3e50;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 10px 10px 0;
    font-size: 18px;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  &:hover::before {
    content: '‹';
    right: -20px;
  }
  &-content {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
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
