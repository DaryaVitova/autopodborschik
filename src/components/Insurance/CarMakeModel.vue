<template>
  <div class="car-search">
    <div class="car-search__input-group">
      <loupe-icon class="car-search__input-icon" />
      <input class="car-search__input" type="text" placeholder="Введите название автомобиля" />
    </div>

    <div class="car-search__spacer-text">или выберете из списка</div>

    <div class="car-search__tabs">
      <div
        class="car-search__tab"
        :class="{ 'car-search__tab--active' :  isActiveTab === 'make' }"
        @click="isActiveTab = 'make'"
      >
        <span class="car-search__tab-text">Марка</span>
      </div>
      <div
        class="car-search__tab"
        :class="{ 'car-search__tab--active' :  isActiveTab === 'model' }"
        @click="isActiveTab = 'model'"
      >
        <span class="car-search__tab-text">Модель</span>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import LoupeIcon from "@/components/SvgIcons/LoupeIcon.vue"
import { ref } from "vue"

const isActiveTab = ref<'make' | 'model'>('make')

</script>

<style lang="scss" scoped>
.car-search {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  --border-radius-tab: 80px;

  &__input-group {
    width: 60%;
    position: relative;
    margin-top: 30px;
  }
  &__input {
    width: 100%;
    border: 1px solid #bbb;
    padding: 15px 10px 15px 60px;
    border-radius: 100px;
    text-overflow: ellipsis;
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2)
    }
    &::placeholder {
      color: #999999;
    }
  }

  &__input-icon {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    color: var(--color-middle-blue);
  }

  &__spacer-text {
    color: #999;
    margin: 30px 0;
  }

  &__tabs {
    display: flex;
    border: 1px solid #286b8c;
    height: 50px;
    border-radius: var(--border-radius-tab);
    width: 40%;
  }

  &__tab {
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      cursor: pointer;
    }

    &--active {
      background-color: var(--color-middle-blue);
      border-radius: var(--border-radius-tab);
      color: #fff;
    }
    &-text {
      padding-inline: 30px;
    }
  }
}
</style>
