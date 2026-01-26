<template>
  <div class="main">
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

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

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
  max-width: 70%;

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
      border-radius: 6px;
      transition: all 0.3s ease;
      border: 2px solid #5296bc;

      &:hover {
        background-color: #f0f8ff;
        opacity: 0.8;
      }

      &.active {
        background-color: #5296bc;
        color: white;
        font-weight: 600;
      }
    }

    &--span {
      font-size: 18px;
      color: #4e4e4e;
    }
  }
}
</style>
