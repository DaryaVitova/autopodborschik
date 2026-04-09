<template>
  <div class="insurance">
    <div class="steps">
      <div class="steps__item">
        <div class="steps__item-circle">1</div>
        <span class="steps__item-text">Марка / модель ТС</span>
      </div>

      <div class="steps__item">
        <div class="steps__item-circle">2</div>
        <span class="steps__item-text">Данные ТС</span>
      </div>

      <div class="steps__item">
        <div class="steps__item-circle">3</div>
        <span class="steps__item-text">Водители</span>
      </div>

      <div class="steps__item">
        <div class="steps__item-circle">4</div>
        <span class="steps__item-text">Рассчет</span>
      </div>
    </div>


  </div>
</template>

<script setup lang='ts'>
</script>

<style lang="scss" scoped>
.insurance {
  margin-top: 100px;
}

.steps {
  --margin-step: 120px;

  display: flex;

  &__item {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      margin-right: var(--margin-step);
    }
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      width: calc(var(--margin-step) + 2px);
      height: 2px;
      background-color: var(--color-middle-blue);
    }

    &-circle {
      width: 40px;
      height: 40px;
      color: #504f4f;
      border: 2px solid var(--color-middle-blue);
      border-radius: 50%;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &-text {
      position: absolute;
      top: 110%;
      color: #504f4f;
      white-space: nowrap;
    }
  }
}
</style>
