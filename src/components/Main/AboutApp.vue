<template>
  <aside class="aboutApp">
    <details class="aboutApp__details">
      <summary>Для кого создано приложение "Автоподборщик"&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        Для специалистов по подбору автомобилей и для всех, кто хочет вести личную подборку понравившихся машин.
      </p>
    </details>

    <details class="aboutApp__details">
      <summary>Как отметить машину проданной&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        Нажмите на карточку автомобиля. Под блоком «Описание» появится кнопка «Машину продали».
        При клике откроется окно, в котором нужно указать сумму, за которую продан автомобиль.
        После ввода суммы нажмите на кнопку «Добавить автомобиль в проданные».
      </p>
    </details>

    <details class="aboutApp__details">
      <summary>Приложение бесплатное&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        Да, приложение полностью бесплатно — вы можете пользоваться им без ограничений.
      </p>
    </details>

    <details class="aboutApp__details">
      <summary>Где хранится информация об автомобилях и фотографии&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        Для хранения информации об автомобилях используется база данных "Firebase",
        фотографии хранятся в базе данных "ImgBB".
      </p>
    </details>

    <details class="aboutApp__details">
      <summary>Какие языки и технологии использованы для создания проекта&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        • &ensp;HTML <br>
        • &ensp;SCSS <br>
        • &ensp;Адаптивная верстка <br>
        • &ensp;TypeScript <br>
        • &ensp;Vue(Composition API) <br>
        • &ensp;Vite <br>
        • &ensp;Pinia <br>
        • &ensp;npm <br>
        • &ensp;Git <br>
        • &ensp;REST API <br>
        • &ensp;Router <br>
      </p>
    </details>
  </aside>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.aboutApp {
  position: absolute;
  z-index: 10000;
  right: 0;
  width: 40%;
  height: fit-content;
  padding-bottom: 150px;
  padding-left: 20px;
  background-color: #f0f0f1;
  border-radius: var(--border-radius-lg);

  &__details {
    position: relative;
    padding: 15px;
    background-color: #fff;
    border-radius: var(--border-radius-lg);
    margin-inline: 15px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    &:not(:first-child) {
      margin-top: 15px;
    }
  }

  &__hidden-text {
    padding-left: 10px;
    margin-top: 10px;
  }
}

details > summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;


  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }

  &::after {
    content: "";
    position: absolute;
    right: 15px;
    display: inline-block;
    min-width: 28px;
    height: 28px;
    flex-shrink: 0;
    margin-left: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    transition: transform 0.2s ease;
  }
}

details > summary::-webkit-details-marker {
  display: none;
}

details[open] > summary::after {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E");
}

summary {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 10px;
  padding-right: 45px;
  font-weight: bold;
}

@media (max-width: 1023px) {
  .aboutApp {
    width: 60%;
  }
}

@media (max-width: 767px) {
  .aboutApp {
    width: 70%;
  }
  summary, .aboutApp__hidden-text {
    font-size: 14px;
  }
}

@media (max-width: 430px) {
  summary, .aboutApp__hidden-text {
    font-size: 12px;
  }
}
</style>
